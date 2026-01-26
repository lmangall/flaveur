"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon, Monitor, User, Mail, Globe, Palette, Bell, X, Database, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { HowItWorks } from "@/app/[locale]/components/HowItWorks";

import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Input } from "@/app/[locale]/components/ui/input";
import { cn } from "@/app/lib/utils";

import {
  getNewsletterStatus,
  subscribeUserToNewsletter,
  unsubscribeUserFromNewsletter,
  type NewsletterStatus,
} from "@/actions/settings";

import {
  getJobAlertPreferences,
  saveJobAlertPreferences,
  type JobAlertPreferences,
} from "@/actions/job-alerts";

import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/constants";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations("Settings");
  const user = session?.user;
  const isLoaded = !isPending;
  const isSignedIn = !!session;
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [newsletterStatus, setNewsletterStatus] = useState<NewsletterStatus>("not_found");
  const [confirmationToken, setConfirmationToken] = useState<string | undefined>();
  const [isLoadingNewsletter, setIsLoadingNewsletter] = useState(true);
  const [isUpdatingNewsletter, setIsUpdatingNewsletter] = useState(false);

  // Job alerts state
  const [jobAlerts, setJobAlerts] = useState<JobAlertPreferences | null>(null);
  const [isLoadingJobAlerts, setIsLoadingJobAlerts] = useState(true);
  const [isSavingJobAlerts, setIsSavingJobAlerts] = useState(false);
  const [jobAlertForm, setJobAlertForm] = useState({
    locations: [] as string[],
    employmentTypes: [] as string[],
    experienceLevels: [] as string[],
    keywords: [] as string[],
    frequency: "daily" as "instant" | "daily" | "weekly",
    isActive: true,
  });
  const [newLocation, setNewLocation] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNewsletterStatus = useCallback(async () => {
    if (!user?.email) return;

    setIsLoadingNewsletter(true);
    try {
      const result = await getNewsletterStatus(user.email);
      setNewsletterStatus(result.status);
      setConfirmationToken(result.confirmationToken);
    } catch {
      console.error("Failed to fetch newsletter status");
    } finally {
      setIsLoadingNewsletter(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.email) {
      fetchNewsletterStatus();
    }
  }, [isLoaded, isSignedIn, user?.email, fetchNewsletterStatus]);

  const fetchJobAlertPreferences = useCallback(async () => {
    setIsLoadingJobAlerts(true);
    try {
      const prefs = await getJobAlertPreferences();
      setJobAlerts(prefs);
      if (prefs) {
        setJobAlertForm({
          locations: prefs.locations || [],
          employmentTypes: prefs.employmentTypes || [],
          experienceLevels: prefs.experienceLevels || [],
          keywords: prefs.keywords || [],
          frequency: prefs.frequency,
          isActive: prefs.isActive,
        });
      }
    } catch {
      console.error("Failed to fetch job alert preferences");
    } finally {
      setIsLoadingJobAlerts(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchJobAlertPreferences();
    }
  }, [isLoaded, isSignedIn, fetchJobAlertPreferences]);

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|fr)/, "");
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const handleNewsletterToggle = async () => {
    if (!user?.email) return;

    setIsUpdatingNewsletter(true);
    try {
      if (newsletterStatus === "subscribed" && confirmationToken) {
        const result = await unsubscribeUserFromNewsletter(confirmationToken);
        if (result.success) {
          setNewsletterStatus("unsubscribed");
          toast.success(t("saved"));
        } else {
          toast.error(t("error"));
        }
      } else {
        const result = await subscribeUserToNewsletter(
          user.email,
          locale
        );
        if (result.success) {
          if (result.message === "confirmation_sent" || result.message === "confirmation_resent") {
            setNewsletterStatus("pending");
          } else {
            setNewsletterStatus("subscribed");
          }
          toast.success(t("saved"));
        } else {
          toast.error(t("error"));
        }
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsUpdatingNewsletter(false);
    }
  };

  const handleSaveJobAlerts = async () => {
    setIsSavingJobAlerts(true);
    try {
      const result = await saveJobAlertPreferences(jobAlertForm);
      if (result.success) {
        toast.success(t("alertsSaved"));
        fetchJobAlertPreferences();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsSavingJobAlerts(false);
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !jobAlertForm.locations.includes(newLocation.trim())) {
      setJobAlertForm({
        ...jobAlertForm,
        locations: [...jobAlertForm.locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setJobAlertForm({
      ...jobAlertForm,
      locations: jobAlertForm.locations.filter((l) => l !== location),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !jobAlertForm.keywords.includes(newKeyword.trim())) {
      setJobAlertForm({
        ...jobAlertForm,
        keywords: [...jobAlertForm.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setJobAlertForm({
      ...jobAlertForm,
      keywords: jobAlertForm.keywords.filter((k) => k !== keyword),
    });
  };

  const toggleEmploymentType = (type: string) => {
    setJobAlertForm({
      ...jobAlertForm,
      employmentTypes: jobAlertForm.employmentTypes.includes(type)
        ? jobAlertForm.employmentTypes.filter((t) => t !== type)
        : [...jobAlertForm.employmentTypes, type],
    });
  };

  const toggleExperienceLevel = (level: string) => {
    setJobAlertForm({
      ...jobAlertForm,
      experienceLevels: jobAlertForm.experienceLevels.includes(level)
        ? jobAlertForm.experienceLevels.filter((l) => l !== level)
        : [...jobAlertForm.experienceLevels, level],
    });
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("signInRequired")}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/${locale}/auth/sign-in`)}>
              {t("signIn")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = user?.name || user?.email || "";
  const email = user?.email || "";

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>{t("profile")}</CardTitle>
            </div>
            <CardDescription>{t("profileDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {t("displayName")}
              </span>
              <span className="text-sm">{displayName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {t("email")}
              </span>
              <span className="text-sm">{email}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("managedByProvider")}</p>
          </CardContent>
        </Card>

        {/* Email Preferences Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>{t("emailPreferences")}</CardTitle>
            </div>
            <CardDescription>{t("emailPreferencesDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">{t("newsletterSubscription")}</span>
                <p className="text-xs text-muted-foreground">{t("newsletterDescription")}</p>
              </div>
              <div className="flex items-center gap-3">
                {isLoadingNewsletter ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <>
                    <Badge
                      variant={newsletterStatus === "subscribed" ? "default" : "secondary"}
                    >
                      {newsletterStatus === "subscribed" && t("subscribed")}
                      {newsletterStatus === "pending" && t("confirmationPending")}
                      {(newsletterStatus === "unsubscribed" || newsletterStatus === "not_found") &&
                        t("notSubscribed")}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewsletterToggle}
                      disabled={isUpdatingNewsletter || newsletterStatus === "pending"}
                    >
                      {isUpdatingNewsletter
                        ? t("saving")
                        : newsletterStatus === "subscribed"
                          ? t("unsubscribe")
                          : t("subscribe")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Alerts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t("jobAlerts")}</CardTitle>
            </div>
            <CardDescription>{t("jobAlertsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingJobAlerts ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <>
                {/* Alert Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{t("jobAlerts")}</span>
                    <p className="text-xs text-muted-foreground">
                      {jobAlertForm.isActive ? t("jobAlertsEnabled") : t("jobAlertsDisabled")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJobAlertForm({ ...jobAlertForm, isActive: !jobAlertForm.isActive })}
                  >
                    {jobAlertForm.isActive ? t("disableAlerts") : t("enableAlerts")}
                  </Button>
                </div>

                {/* Alert Frequency */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("alertFrequency")}</span>
                  <Select
                    value={jobAlertForm.frequency}
                    onValueChange={(value: "instant" | "daily" | "weekly") =>
                      setJobAlertForm({ ...jobAlertForm, frequency: value })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">{t("instant")}</SelectItem>
                      <SelectItem value="daily">{t("daily")}</SelectItem>
                      <SelectItem value="weekly">{t("weekly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Locations */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("locations")}</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("locationsPlaceholder")}
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addLocation}>
                      +
                    </Button>
                  </div>
                  {jobAlertForm.locations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobAlertForm.locations.map((location) => (
                        <Badge key={location} variant="secondary" className="flex items-center gap-1">
                          {location}
                          <button onClick={() => removeLocation(location)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Employment Types */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("employmentTypes")}</span>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        className={cn(
                          jobAlertForm.employmentTypes.includes(option.value) &&
                            "border-primary bg-primary/10"
                        )}
                        onClick={() => toggleEmploymentType(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Experience Levels */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("experienceLevels")}</span>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        className={cn(
                          jobAlertForm.experienceLevels.includes(option.value) &&
                            "border-primary bg-primary/10"
                        )}
                        onClick={() => toggleExperienceLevel(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">{t("keywords")}</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("keywordsPlaceholder")}
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addKeyword}>
                      +
                    </Button>
                  </div>
                  {jobAlertForm.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobAlertForm.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <Button onClick={handleSaveJobAlerts} disabled={isSavingJobAlerts}>
                  {isSavingJobAlerts ? t("saving") : t("saveAlerts")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>{t("language")}</CardTitle>
            </div>
            <CardDescription>{t("languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="fr">{t("french")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>{t("appearance")}</CardTitle>
            </div>
            <CardDescription>{t("appearanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-sm font-medium">{t("theme")}</span>
              <p className="text-xs text-muted-foreground mb-3">{t("themeDescription")}</p>
              {mounted && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      theme === "light" && "border-primary bg-primary/10"
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    {t("light")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      theme === "dark" && "border-primary bg-primary/10"
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    {t("dark")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      theme === "system" && "border-primary bg-primary/10"
                    )}
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4" />
                    {t("system")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How It Works - EU Compliance Section */}
        <HowItWorks
          title={t("howItWorksTitle")}
          steps={[
            {
              icon: Database,
              title: t("step1Title"),
              description: t("step1Description"),
            },
            {
              icon: Search,
              title: t("step2Title"),
              description: t("step2Description"),
            },
            {
              icon: RefreshCw,
              title: t("step3Title"),
              description: t("step3Description"),
            },
          ]}
          tip={{
            icon: AlertTriangle,
            title: t("tipTitle"),
            description: t("tipDescription"),
          }}
          faqLink={{
            text: t("faqLinkText"),
            category: "regulatory",
          }}
        />
      </div>
    </div>
  );
}

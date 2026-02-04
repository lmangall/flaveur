"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon, Monitor, User, Mail, Globe, Palette, Bell, X, Database, Search, RefreshCw, AlertTriangle, Briefcase, Link2, Plus, Trash2, GraduationCap, Building, MapPin, Linkedin, Instagram, Twitter, Github, ExternalLink } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Input } from "@/app/[locale]/components/ui/input";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { Label } from "@/app/[locale]/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/[locale]/components/ui/alert-dialog";
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
  PROFILE_TYPE_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
  FIELD_OF_STUDY_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
} from "@/constants";

import {
  getMyProfile,
  updateUserProfile,
  addSocialLink,
  removeSocialLink,
  type ProfileWithLinks,
  type ProfileFormData,
} from "@/actions/profile";
import { deleteAccount } from "@/actions/account";

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

  // Profile state
  const [profile, setProfile] = useState<ProfileWithLinks | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    bio: "",
    profile_type: null,
    organization: "",
    job_title: "",
    location: "",
    years_of_experience: null,
    specializations: [],
    certifications: [],
    field_of_study: null,
    professional_memberships: [],
    is_profile_public: true,
    open_to_opportunities: false,
  });
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newMembership, setNewMembership] = useState("");

  // Social links state
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("linkedin");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
      if (profileData) {
        setProfileForm({
          bio: profileData.bio || "",
          profile_type: profileData.profile_type,
          organization: profileData.organization || "",
          job_title: profileData.job_title || "",
          location: profileData.location || "",
          years_of_experience: profileData.years_of_experience,
          specializations: profileData.specializations || [],
          certifications: profileData.certifications || [],
          field_of_study: profileData.field_of_study,
          professional_memberships: profileData.professional_memberships || [],
          is_profile_public: profileData.is_profile_public ?? true,
          open_to_opportunities: profileData.open_to_opportunities ?? false,
        });
      }
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

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

  // Profile handlers
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const result = await updateUserProfile(profileForm);
      if (result.success) {
        toast.success(t("profileSaved"));
        fetchProfile();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !profileForm.specializations?.includes(newSpecialization.trim())) {
      setProfileForm({
        ...profileForm,
        specializations: [...(profileForm.specializations || []), newSpecialization.trim()],
      });
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setProfileForm({
      ...profileForm,
      specializations: profileForm.specializations?.filter((s) => s !== spec) || [],
    });
  };

  const addCertification = () => {
    if (newCertification.trim() && !profileForm.certifications?.includes(newCertification.trim())) {
      setProfileForm({
        ...profileForm,
        certifications: [...(profileForm.certifications || []), newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setProfileForm({
      ...profileForm,
      certifications: profileForm.certifications?.filter((c) => c !== cert) || [],
    });
  };

  const addMembership = () => {
    if (newMembership.trim() && !profileForm.professional_memberships?.includes(newMembership.trim())) {
      setProfileForm({
        ...profileForm,
        professional_memberships: [...(profileForm.professional_memberships || []), newMembership.trim()],
      });
      setNewMembership("");
    }
  };

  const removeMembership = (membership: string) => {
    setProfileForm({
      ...profileForm,
      professional_memberships: profileForm.professional_memberships?.filter((m) => m !== membership) || [],
    });
  };

  const handleAddSocialLink = async () => {
    if (!newSocialUrl.trim()) return;

    setIsAddingSocialLink(true);
    try {
      const result = await addSocialLink({
        platform: newSocialPlatform,
        url: newSocialUrl.trim(),
      });
      if (result.success) {
        toast.success(t("socialLinkAdded"));
        setNewSocialUrl("");
        fetchProfile();
      } else {
        toast.error(result.error === "invalid_url" ? t("invalidUrl") : t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsAddingSocialLink(false);
    }
  };

  const handleRemoveSocialLink = async (linkId: number) => {
    try {
      const result = await removeSocialLink(linkId);
      if (result.success) {
        toast.success(t("socialLinkRemoved"));
        fetchProfile();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin": return <Linkedin className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "twitter": return <Twitter className="h-4 w-4" />;
      case "github": return <Github className="h-4 w-4" />;
      case "website": return <Globe className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const handleDeleteAccount = async () => {
    if (!email || deleteConfirmEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
      setDeleteError(t("emailMismatch"));
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteAccount(deleteConfirmEmail);

      if (result.success) {
        await signOut();
        router.push(`/${locale}`);
        toast.success(t("accountDeleted"));
      } else {
        setDeleteError(t(result.error || "deletionFailed"));
      }
    } catch {
      setDeleteError(t("deletionFailed"));
    } finally {
      setIsDeleting(false);
    }
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

  // Settings tabs configuration
  const settingsTabs = [
    { value: "profile", label: t("profileTab") || "Profile", icon: User },
    { value: "social", label: t("socialTab") || "Social", icon: Link2 },
    { value: "notifications", label: t("notificationsTab") || "Notifications", icon: Bell },
    { value: "preferences", label: t("preferencesTab") || "Preferences", icon: Palette },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          {settingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 py-2.5"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Basic Profile Card */}
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

        {/* Extended Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>{t("extendedProfile")}</CardTitle>
            </div>
            <CardDescription>{t("extendedProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">{t("bio")}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t("bioPlaceholder")}
                    value={profileForm.bio || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(profileForm.bio?.length || 0)}/500
                  </p>
                </div>

                {/* Profile Type */}
                <div className="space-y-2">
                  <Label>{t("profileType")}</Label>
                  <Select
                    value={profileForm.profile_type || ""}
                    onValueChange={(value) => setProfileForm({ ...profileForm, profile_type: value })}
                  >
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder={t("selectProfileType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFILE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`profileType_${option.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label htmlFor="organization">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t("organization")}
                    </div>
                  </Label>
                  <Input
                    id="organization"
                    placeholder={t("organizationPlaceholder")}
                    value={profileForm.organization || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="job_title">{t("jobTitle")}</Label>
                  <Input
                    id="job_title"
                    placeholder={t("jobTitlePlaceholder")}
                    value={profileForm.job_title || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, job_title: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="profile_location">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("profileLocation")}
                    </div>
                  </Label>
                  <Input
                    id="profile_location"
                    placeholder={t("profileLocationPlaceholder")}
                    value={profileForm.location || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label>{t("yearsOfExperience")}</Label>
                  <Select
                    value={profileForm.years_of_experience || ""}
                    onValueChange={(value) => setProfileForm({ ...profileForm, years_of_experience: value })}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t("selectExperience")} />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS_OF_EXPERIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field of Study */}
                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {t("fieldOfStudy")}
                    </div>
                  </Label>
                  <Select
                    value={profileForm.field_of_study || ""}
                    onValueChange={(value) => setProfileForm({ ...profileForm, field_of_study: value })}
                  >
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder={t("selectFieldOfStudy")} />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OF_STUDY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`fieldOfStudy_${option.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>{t("specializations")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("specializationsPlaceholder")}
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addSpecialization}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {profileForm.specializations && profileForm.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileForm.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                          {spec}
                          <button onClick={() => removeSpecialization(spec)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <Label>{t("certifications")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("certificationsPlaceholder")}
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addCertification}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {profileForm.certifications && profileForm.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileForm.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                          {cert}
                          <button onClick={() => removeCertification(cert)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional Memberships */}
                <div className="space-y-2">
                  <Label>{t("professionalMemberships")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("membershipsPlaceholder")}
                      value={newMembership}
                      onChange={(e) => setNewMembership(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMembership())}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addMembership}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {profileForm.professional_memberships && profileForm.professional_memberships.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileForm.professional_memberships.map((membership) => (
                        <Badge key={membership} variant="secondary" className="flex items-center gap-1">
                          {membership}
                          <button onClick={() => removeMembership(membership)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibility Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("publicProfile")}</Label>
                      <p className="text-xs text-muted-foreground">{t("publicProfileDescription")}</p>
                    </div>
                    <Switch
                      checked={profileForm.is_profile_public ?? true}
                      onCheckedChange={(checked) => setProfileForm({ ...profileForm, is_profile_public: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("openToOpportunities")}</Label>
                      <p className="text-xs text-muted-foreground">{t("openToOpportunitiesDescription")}</p>
                    </div>
                    <Switch
                      checked={profileForm.open_to_opportunities ?? false}
                      onCheckedChange={(checked) => setProfileForm({ ...profileForm, open_to_opportunities: checked })}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? t("saving") : t("saveProfile")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
        {/* Social Links Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              <CardTitle>{t("socialLinks")}</CardTitle>
            </div>
            <CardDescription>{t("socialLinksDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Existing Links */}
                {profile?.social_links && profile.social_links.length > 0 && (
                  <div className="space-y-2">
                    {profile.social_links.map((link) => (
                      <div key={link.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        {getSocialIcon(link.platform)}
                        <span className="text-sm font-medium capitalize">{link.platform}</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary truncate flex-1"
                        >
                          {link.url}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSocialLink(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Link */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t("socialUrlPlaceholder")}
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSocialLink())}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSocialLink} disabled={isAddingSocialLink || !newSocialUrl.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addLink")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
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
        </TabsContent>
      </Tabs>

      {/* How It Works - EU Compliance Section */}
      <div className="mt-6">
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

      {/* Danger Zone */}
      <Card className="border-destructive mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
          </div>
          <CardDescription>{t("dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium">{t("deleteAccount")}</p>
              <p className="text-sm text-muted-foreground">
                {t("deleteAccountDescription")}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>{t("deleteAccountWarning")}</p>
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
                        <p className="font-medium text-destructive">{t("deleteAccountList")}</p>
                        <ul className="list-disc list-inside mt-2 text-muted-foreground">
                          <li>{t("deleteItem1")}</li>
                          <li>{t("deleteItem2")}</li>
                          <li>{t("deleteItem3")}</li>
                          <li>{t("deleteItem4")}</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-email">{t("typeEmailToConfirm")}</Label>
                        <Input
                          id="confirm-email"
                          type="email"
                          placeholder={email}
                          value={deleteConfirmEmail}
                          onChange={(e) => {
                            setDeleteConfirmEmail(e.target.value);
                            setDeleteError(null);
                          }}
                        />
                        {deleteError && (
                          <p className="text-sm text-destructive">{deleteError}</p>
                        )}
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setDeleteConfirmEmail("");
                    setDeleteError(null);
                  }}>
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmEmail.toLowerCase().trim() !== email.toLowerCase().trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? t("deleting") : t("deleteAccountConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

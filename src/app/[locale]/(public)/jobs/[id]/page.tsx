"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import {
  BriefcaseBusiness,
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Banknote,
  Globe,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Eye,
  User,
  Clock,
  ExternalLink,
  Share2,
  Bookmark,
  Mail,
  Phone,
  Beaker,
} from "lucide-react";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { getJobById, addJobInteraction } from "@/actions/jobs";
import { cn } from "@/app/lib/utils";

interface JobOffer {
  id: string;
  title: string;
  description: string;
  company_name: string;
  original_company_name?: string;
  through_recruiter: boolean;
  source_website?: string;
  source_url?: string;
  location: string;
  employment_type: string;
  salary?: string;
  requirements?: string[];
  tags?: string[];
  industry?: string;
  experience_level?: string;
  contact_person?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  posted_at: string;
  expires_at?: string;
}

export default function JobDetailPage() {
  const t = useTranslations("JobDetail");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;
  const [job, setJob] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  const trackInteraction = useCallback(
    async (action: "viewed" | "applied" | "seen_contact") => {
      if (!isSignedIn || !id) return;
      try {
        await addJobInteraction(id, action, "job_detail");
      } catch (err) {
        console.error("Error tracking job interaction:", err);
      }
    },
    [isSignedIn, id]
  );

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        setIsLoading(true);
        const data = await getJobById(id);
        setJob(data as JobOffer);
        if (isSignedIn) {
          trackInteraction("viewed");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(t("errorFetchingJobDetails"));
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded && id) {
      fetchJobDetail();
    }
  }, [isLoaded, isSignedIn, id, t, trackInteraction]);

  const handleShowContact = () => {
    setShowContact(true);
    trackInteraction("seen_contact");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return t("today") || "Today";
    if (diffInDays === 1) return t("yesterday") || "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7 && diffInDays > 0;
  };

  if (isLoading) {
    return <JobDetailSkeleton onBack={() => router.back()} onBackToLab={() => router.push("/flavours")} t={t} />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              {t("backToJobs")}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/flavours")}
            >
              <Beaker className="h-4 w-4" />
              {t("backToLab")}
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <BriefcaseBusiness className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("jobNotFound")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {error || t("jobNotAvailable")}
            </p>
            <Button onClick={() => router.push("/jobs")}>
              {t("browseAllJobs")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/40">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-background to-pink-50/40 dark:from-amber-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-pink/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />

        {/* Molecular decoration */}
        <div className="absolute top-16 right-16 opacity-15 dark:opacity-10 hidden lg:block">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-pink animate-pulse" />
            <div className="absolute top-8 left-10 w-3 h-3 rounded-full bg-amber-500" />
            <div className="absolute top-3 left-16 w-2.5 h-2.5 rounded-full bg-pink/70" />
            <div className="absolute -top-2 left-20 w-2 h-2 rounded-full bg-amber-400" />
            <div className="absolute top-0 left-8 w-px h-10 bg-gradient-to-b from-pink to-amber-500 rotate-45" />
            <div className="absolute top-6 left-10 w-px h-8 bg-gradient-to-b from-amber-500 to-pink rotate-12" />
            <div className="absolute top-2 left-14 w-px h-6 bg-gradient-to-b from-pink/60 to-amber-400/60 -rotate-12" />
          </div>
        </div>

        <div className="container relative mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Back buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToJobs")}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/flavours")}
            >
              <Beaker className="h-4 w-4" />
              {t("backToLab")}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main header content */}
            <div className="lg:col-span-2">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-pink/10 text-pink border-pink/20">
                  <Beaker className="h-3 w-3 mr-1" />
                  {job.industry || t("flavorIndustry") || "Flavor Industry"}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {getRelativeTime(job.posted_at)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {job.title}
              </h1>

              {/* Company info */}
              <div className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground mb-6">
                <span className="flex items-center gap-2 font-medium text-foreground/90">
                  <Building2 className="h-5 w-5 text-pink" />
                  {job.company_name}
                </span>
                {job.through_recruiter && job.original_company_name && (
                  <span className="text-base">
                    {t("forCompany", { company: job.original_company_name })}
                  </span>
                )}
              </div>

              {/* Key details row */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="h-8 px-3 gap-1.5 bg-muted/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </Badge>
                <Badge variant="secondary" className="h-8 px-3 gap-1.5 bg-muted/70">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  {job.employment_type}
                </Badge>
                {job.experience_level && (
                  <Badge variant="secondary" className="h-8 px-3 gap-1.5 bg-muted/70">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {job.experience_level}
                  </Badge>
                )}
                {job.salary && (
                  <Badge variant="secondary" className="h-8 px-3 gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                    <Banknote className="h-3.5 w-3.5" />
                    {job.salary}
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm rounded-full bg-pink/5 text-pink/80 border border-pink/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions card */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Apply button */}
                  {job.source_url ? (
                    <Button
                      className="w-full h-12 text-base gap-2 bg-foreground text-background hover:bg-foreground/90"
                      asChild
                      onClick={() => trackInteraction("applied")}
                    >
                      <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                        {t("applyNow")}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => trackInteraction("applied")}
                    >
                      {t("applyNow")}
                    </Button>
                  )}

                  {/* Secondary actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Bookmark className="h-4 w-4" />
                      {t("save") || "Save"}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      {t("share") || "Share"}
                    </Button>
                  </div>

                  {/* Deadline warning */}
                  {job.expires_at && (
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg text-sm",
                      isExpiringSoon(job.expires_at)
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {t("applicationDeadline")}: <strong>{formatDate(job.expires_at)}</strong>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t("description")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_strong]:font-semibold [&_a]:text-pink [&_a]:underline">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{t("requirements")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <span className="text-foreground leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Source info */}
            {job.source_website && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg bg-muted/30 border border-border/50">
                <FileText className="h-4 w-4" />
                <span>
                  {t("sourcedFrom")}{" "}
                  {job.source_url ? (
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink hover:underline font-medium"
                    >
                      {job.source_website}
                    </a>
                  ) : (
                    <span className="font-medium">{job.source_website}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Right column - sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-pink" />
                  {t("contactInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showContact && job.contact_person ? (
                  <div className="space-y-3">
                    {job.contact_person.name && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink/20 to-amber-500/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-foreground/70" />
                        </div>
                        <div>
                          <p className="font-medium">{job.contact_person.name}</p>
                          <p className="text-sm text-muted-foreground">{t("contactPerson") || "Contact Person"}</p>
                        </div>
                      </div>
                    )}

                    {job.contact_person.email && (
                      <a
                        href={`mailto:${job.contact_person.email}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-pink/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-pink" />
                        </div>
                        <span className="text-sm text-foreground/90 group-hover:text-pink transition-colors truncate">
                          {job.contact_person.email}
                        </span>
                      </a>
                    )}

                    {job.contact_person.phone && (
                      <a
                        href={`tel:${job.contact_person.phone}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm text-foreground/90 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {job.contact_person.phone}
                        </span>
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleShowContact}
                      className="w-full gap-2"
                      variant="outline"
                      disabled={!isSignedIn}
                    >
                      <Eye className="h-4 w-4" />
                      {t("viewContactInfo")}
                    </Button>
                    {!isSignedIn && (
                      <p className="text-xs text-muted-foreground text-center">
                        {t("signInToViewContact")}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  {t("aboutCompany") || "About the Company"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{job.company_name}</p>
                    {job.industry && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Globe className="h-3.5 w-3.5" />
                        {job.industry}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job details summary */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t("jobDetails") || "Job Details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {t("location") || "Location"}
                    </p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {t("employmentType") || "Type"}
                    </p>
                    <p className="font-medium">{job.employment_type}</p>
                  </div>
                  {job.experience_level && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {t("experience") || "Experience"}
                      </p>
                      <p className="font-medium">{job.experience_level}</p>
                    </div>
                  )}
                  {job.salary && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {t("salary") || "Salary"}
                      </p>
                      <p className="font-medium text-amber-700 dark:text-amber-400">{job.salary}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {t("posted") || "Posted"}
                  </p>
                  <p className="font-medium">{formatDate(job.posted_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function JobDetailSkeleton({
  onBack,
  onBackToLab,
  t
}: {
  onBack: () => void;
  onBackToLab: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="border-b border-border/40 bg-gradient-to-br from-amber-50/60 via-background to-pink-50/40 dark:from-amber-950/20 dark:via-background dark:to-pink-950/20">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" className="gap-2 -ml-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              {t("backToJobs")}
            </Button>
            <Button variant="outline" className="gap-2" onClick={onBackToLab}>
              <Beaker className="h-4 w-4" />
              {t("backToLab")}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border/50 p-6 space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="rounded-xl border border-border/50 p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border/50 p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="rounded-xl border border-border/50 p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

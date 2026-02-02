"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  BriefcaseBusiness,
  MapPin,
  Building2,
  Calendar,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Clock,
  TrendingUp,
  Beaker,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getJobs, addJobInteraction } from "@/actions/jobs";
import { EMPLOYMENT_TYPE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from "@/constants";
import { cn } from "@/app/lib/utils";

interface JobOffer {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  posted_at: string;
  expires_at: string;
  industry: string;
  experience_level: string;
  salary: string;
  tags: string[];
}

export default function JobsPage() {
  const t = useTranslations("Jobs");
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all");
  const [experienceLevelFilter, setExperienceLevelFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    async function fetchJobsData() {
      try {
        setIsLoading(true);
        const data = await getJobs();
        setJobs(data as JobOffer[]);
        setError(null);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(t("errorFetchingJobs"));
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) {
      fetchJobsData();
    }
  }, [isLoaded, t]);

  const uniqueLocations = useMemo(() => {
    const locations = jobs
      .map((job) => job.location)
      .filter((location): location is string => !!location);
    return [...new Set(locations)].sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company_name &&
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEmploymentType =
        employmentTypeFilter === "all" ||
        job.employment_type === employmentTypeFilter;

      const matchesExperienceLevel =
        experienceLevelFilter === "all" ||
        job.experience_level === experienceLevelFilter;

      const matchesLocation =
        locationFilter === "all" || job.location === locationFilter;

      return (
        matchesSearch &&
        matchesEmploymentType &&
        matchesExperienceLevel &&
        matchesLocation
      );
    });
  }, [jobs, searchQuery, employmentTypeFilter, experienceLevelFilter, locationFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    employmentTypeFilter !== "all" ||
    experienceLevelFilter !== "all" ||
    locationFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setEmploymentTypeFilter("all");
    setExperienceLevelFilter("all");
    setLocationFilter("all");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
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
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return formatDate(dateString);
  };

  const trackJobView = async (jobId: string) => {
    if (!isSignedIn) return;
    try {
      await addJobInteraction(jobId, "viewed", "jobs_listing");
    } catch (err) {
      console.error("Error tracking job view:", err);
    }
  };

  // Get featured jobs (first 2 most recent)
  const featuredJobs = filteredJobs.slice(0, 2);
  const regularJobs = filteredJobs.slice(2);

  return (
    <div className="min-h-screen">
      {/* Hero Section with gradient background */}
      <div className="relative overflow-hidden border-b border-border/40">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-background to-pink-50/50 dark:from-amber-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />

        {/* Molecular decoration */}
        <div className="absolute top-20 right-20 opacity-20 dark:opacity-10">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-pink animate-pulse" />
            <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-amber-500" />
            <div className="absolute top-2 left-12 w-2.5 h-2.5 rounded-full bg-pink/70" />
            <div className="absolute top-0 left-6 w-px h-8 bg-gradient-to-b from-pink to-amber-500 rotate-45" />
            <div className="absolute top-4 left-8 w-px h-6 bg-gradient-to-b from-amber-500 to-pink rotate-12" />
          </div>
        </div>

        <div className="container relative mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink/10 border border-pink/20 text-pink text-sm font-medium mb-6 reveal-up">
              <Beaker className="w-4 h-4" />
              <span>{t("careerOpportunities") || "Career Opportunities"}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 reveal-up delay-100">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                {t("jobListingHeading") || "Find Your Next Role"}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl reveal-up delay-200">
              {t("jobListingSubheading") || "Discover opportunities in the flavor and fragrance industry"}
            </p>
          </div>

          {/* Search Bar - Prominent */}
          <div className="mt-10 max-w-2xl reveal-up delay-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink/20 to-amber-500/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("searchJobs") || "Search by title or company..."}
                    className="pl-12 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl shrink-0 transition-colors",
                    showFilters && "bg-pink/10 text-pink"
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
                <Button
                  className="h-12 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 shrink-0"
                >
                  {t("search") || "Search"}
                </Button>
              </div>
            </div>

            {/* Expandable Filters */}
            <div className={cn(
              "grid transition-all duration-300 ease-out",
              showFilters ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <Select
                    value={employmentTypeFilter}
                    onValueChange={setEmploymentTypeFilter}
                  >
                    <SelectTrigger className="w-[160px] h-10 bg-background border-border/50">
                      <SelectValue placeholder={t("employmentType") || "Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allTypes") || "All Types"}</SelectItem>
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={experienceLevelFilter}
                    onValueChange={setExperienceLevelFilter}
                  >
                    <SelectTrigger className="w-[160px] h-10 bg-background border-border/50">
                      <SelectValue placeholder={t("experienceLevel") || "Experience"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allLevels") || "All Levels"}</SelectItem>
                      {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {uniqueLocations.length > 0 && (
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-[180px] h-10 bg-background border-border/50">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t("location") || "Location"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("allLocations") || "All Locations"}</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-10 text-muted-foreground hover:text-foreground"
                    >
                      <X className="mr-1 h-4 w-4" />
                      {t("clearFilters") || "Clear"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Results count & active filters */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {filteredJobs.length === jobs.length
                ? t("showingAllJobs", { count: jobs.length }) || `${jobs.length} opportunities available`
                : t("showingFilteredJobs", { filtered: filteredJobs.length, total: jobs.length }) ||
                  `Showing ${filteredJobs.length} of ${jobs.length} jobs`}
            </p>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    &ldquo;{searchQuery}&rdquo;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {employmentTypeFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === employmentTypeFilter)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setEmploymentTypeFilter("all")} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-8">
            {error}
          </div>
        )}

        {isLoading ? (
          <JobsLoadingSkeleton />
        ) : filteredJobs.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} t={t} />
        ) : (
          <div className="space-y-12">
            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold">{t("featuredPositions") || "Featured Positions"}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 stagger-children">
                  {featuredJobs.map((job, index) => (
                    <FeaturedJobCard
                      key={job.id}
                      job={job}
                      index={index}
                      onView={trackJobView}
                      getRelativeTime={getRelativeTime}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Regular Jobs List */}
            {regularJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">{t("allPositions") || "All Positions"}</h2>
                </div>
                <div className="space-y-4 stagger-children-fast">
                  {regularJobs.map((job) => (
                    <JobListItem
                      key={job.id}
                      job={job}
                      onView={trackJobView}
                      getRelativeTime={getRelativeTime}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Featured Job Card Component
function FeaturedJobCard({
  job,
  index,
  onView,
  getRelativeTime,
  t
}: {
  job: JobOffer;
  index: number;
  onView: (id: string) => void;
  getRelativeTime: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  const isNew = new Date(job.posted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Link
      href={`/jobs/${job.id}`}
      onClick={() => onView(job.id)}
      className="group relative block"
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
        "hover:border-pink/40 hover:shadow-xl hover:shadow-pink/5 hover:-translate-y-1",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-0 before:transition-opacity hover:before:opacity-100",
        index === 0
          ? "before:from-pink/5 before:to-amber-500/5"
          : "before:from-amber-500/5 before:to-pink/5"
      )}>
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink/10 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isNew && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                    {t("new") || "New"}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getRelativeTime(job.posted_at)}
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight group-hover:text-pink transition-colors truncate">
                {job.title}
              </h3>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink/20 to-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="h-5 w-5 text-foreground/70 -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </div>

          {/* Company & Location */}
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5 font-medium text-foreground/80">
              <Building2 className="h-4 w-4" />
              {job.company_name}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-muted/50">
              <BriefcaseBusiness className="h-3 w-3 mr-1" />
              {job.employment_type}
            </Badge>
            {job.experience_level && (
              <Badge variant="secondary" className="bg-muted/50">
                {job.experience_level}
              </Badge>
            )}
            {job.salary && (
              <span className="text-sm font-medium text-foreground/80">
                {job.salary}
              </span>
            )}
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-full bg-pink/5 text-pink/80 border border-pink/10"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 4 && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                  +{job.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Job List Item Component
function JobListItem({
  job,
  onView,
  getRelativeTime,
  t
}: {
  job: JobOffer;
  onView: (id: string) => void;
  getRelativeTime: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      onClick={() => onView(job.id)}
      className="group block"
    >
      <div className={cn(
        "relative flex items-center gap-6 p-5 rounded-xl border border-border/40 bg-card/50",
        "transition-all duration-200",
        "hover:bg-card hover:border-border hover:shadow-md"
      )}>
        {/* Company Avatar */}
        <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 items-center justify-center">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold group-hover:text-pink transition-colors truncate">
              {job.title}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {getRelativeTime(job.posted_at)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/70">{job.company_name}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{job.employment_type}</span>
          </div>
        </div>

        {/* Tags (desktop only) */}
        <div className="hidden lg:flex items-center gap-2">
          {job.tags?.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Arrow */}
        <div className="shrink-0">
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-pink group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

// Loading Skeleton
function JobsLoadingSkeleton() {
  return (
    <div className="space-y-12">
      {/* Featured skeleton */}
      <section>
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border/50 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-7 w-48" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* List skeleton */}
      <section>
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-6 p-5 rounded-xl border border-border/40">
              <Skeleton className="hidden sm:block h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="hidden lg:block h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Empty State
function EmptyState({
  hasFilters,
  onClear,
  t
}: {
  hasFilters: boolean;
  onClear: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <BriefcaseBusiness className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t("noJobsFound") || "No jobs found"}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {hasFilters
          ? t("tryDifferentFilters") || "Try adjusting your search or filters to find more opportunities"
          : t("checkBackLater") || "Check back soon for new opportunities"}
      </p>
      {hasFilters && (
        <Button variant="outline" className="mt-6" onClick={onClear}>
          {t("clearFilters") || "Clear Filters"}
        </Button>
      )}
    </div>
  );
}

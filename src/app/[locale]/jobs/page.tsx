"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  BriefcaseBusiness,
  MapPin,
  Building,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getJobs, addJobInteraction } from "@/actions/jobs";

// Define JobOffer type based on your backend
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
  const { isLoaded, isSignedIn } = useAuth();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Only fetch if auth is loaded
    if (isLoaded) {
      fetchJobsData();
    }
  }, [isLoaded, t]);

  // Format date in a localized way
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Track job view interaction
  const trackJobView = async (jobId: string) => {
    if (!isSignedIn) return;

    try {
      await addJobInteraction(parseInt(jobId), "viewed", "jobs_listing");
    } catch (err) {
      console.error("Error tracking job view:", err);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("jobListingHeading")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("jobListingSubheading")}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full rounded" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <div className="text-muted-foreground flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {job.company_name}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <BriefcaseBusiness className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.employment_type}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {t("postedOn", { date: formatDate(job.posted_at) })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags &&
                        job.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      {job.tags && job.tags.length > 3 && (
                        <Badge variant="outline">+{job.tags.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => trackJobView(job.id)}
                  >
                    <Link href={`/jobs/${job.id}`}>
                      {t("viewDetails")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && jobs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium">{t("noJobsFound")}</h3>
            <p className="text-muted-foreground mt-2">{t("checkBackLater")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

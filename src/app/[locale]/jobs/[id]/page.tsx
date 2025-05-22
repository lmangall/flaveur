"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import {
  BriefcaseBusiness,
  MapPin,
  Building,
  Calendar,
  GraduationCap,
  Banknote,
  Globe,
  FileText,
  CheckCircle,
  ArrowLeft,
  Eye,
  User,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";

// Define more detailed JobOffer type
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
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  // Track job interactions (viewed, applied, seen_contact)
  const trackInteraction = useCallback(
    async (action: "viewed" | "applied" | "seen_contact") => {
      if (!isSignedIn || !id) return;

      try {
        const token = await getToken();
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${id}/interactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action,
              referrer: "job_detail",
            }),
          }
        );
      } catch (err) {
        console.error("Error tracking job interaction:", err);
      }
    },
    [isSignedIn, getToken, id]
  );

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        setIsLoading(true);

        // Get auth token if user is signed in
        let headers = {};
        if (isLoaded && isSignedIn) {
          const token = await getToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${id}`,
          {
            headers,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setJob(data);

        // Record interaction
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

    // Only fetch if auth is loaded
    if (isLoaded && id) {
      fetchJobDetail();
    }
  }, [isLoaded, isSignedIn, getToken, id, t, trackInteraction]);

  // Handle contact info reveal
  const handleShowContact = () => {
    setShowContact(true);
    trackInteraction("seen_contact");
  };

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

  if (isLoading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToJobs")}
        </Button>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToJobs")}
        </Button>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{t("jobNotFound")}</h2>
          <p className="text-muted-foreground">
            {error || t("jobNotAvailable")}
          </p>
          <Button className="mt-4" onClick={() => router.push("/jobs")}>
            {t("browseAllJobs")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToJobs")}
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{job.company_name}</span>
              {job.through_recruiter && job.original_company_name && (
                <span className="ml-1">
                  {t("forCompany", { company: job.original_company_name })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center">
                <BriefcaseBusiness className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{job.employment_type}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {t("postedOn", { date: formatDate(job.posted_at) })}
                </span>
              </div>
              {job.industry && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{job.industry}</span>
                </div>
              )}
              {job.experience_level && (
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{job.experience_level}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList>
              <TabsTrigger value="description">{t("description")}</TabsTrigger>
              <TabsTrigger value="requirements">
                {t("requirements")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-4">
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  {t("noRequirementsListed")}
                </p>
              )}
            </TabsContent>
          </Tabs>

          {job.source_website && (
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-1" />
              <span>
                {t("sourcedFrom")}{" "}
                {job.source_url ? (
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {job.source_website}
                  </a>
                ) : (
                  job.source_website
                )}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("applicationInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.expires_at && (
                <div>
                  <p className="text-sm font-medium">
                    {t("applicationDeadline")}
                  </p>
                  <p className="text-sm">{formatDate(job.expires_at)}</p>
                </div>
              )}

              {showContact && job.contact_person ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("contactInformation")}
                  </p>

                  {job.contact_person.name && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.contact_person.name}</span>
                    </div>
                  )}

                  {job.contact_person.email && (
                    <div>
                      <a
                        href={`mailto:${job.contact_person.email}`}
                        className="text-primary hover:underline block"
                      >
                        {job.contact_person.email}
                      </a>
                    </div>
                  )}

                  {job.contact_person.phone && (
                    <div>
                      <a
                        href={`tel:${job.contact_person.phone}`}
                        className="text-primary hover:underline block"
                      >
                        {job.contact_person.phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleShowContact}
                  className="w-full"
                  disabled={!isSignedIn}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("viewContactInfo")}
                </Button>
              )}

              {!isSignedIn && (
                <p className="text-xs text-muted-foreground text-center">
                  {t("signInToViewContact")}
                </p>
              )}

              <Button
                variant="default"
                className="w-full"
                onClick={() => trackInteraction("applied")}
              >
                {t("applyNow")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

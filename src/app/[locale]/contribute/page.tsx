"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  PlusCircle,
  FlaskConical,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import { getUserSubmissions, getUserFeedback } from "@/actions/contributions";
import type { Substance, SubstanceFeedback } from "@/app/type";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function getVerificationBadge(status: string) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    case "under_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Eye className="h-3 w-3 mr-1" />
          Under Review
        </Badge>
      );
    case "user_entry":
    default:
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function getFeedbackBadge(status: string) {
  switch (status) {
    case "resolved":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "under_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Eye className="h-3 w-3 mr-1" />
          Under Review
        </Badge>
      );
    case "duplicate":
      return (
        <Badge variant="outline">
          <AlertCircle className="h-3 w-3 mr-1" />
          Duplicate
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function SubmissionCard({ substance }: { substance: Substance }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">
            {substance.common_name}
          </CardTitle>
          {getVerificationBadge(substance.verification_status)}
        </div>
        <CardDescription>
          Submitted{" "}
          {substance.submitted_at
            ? formatRelativeTime(substance.submitted_at)
            : "recently"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground space-y-1">
          {substance.cas_id && <p>CAS: {substance.cas_id}</p>}
          {substance.fema_number && <p>FEMA: {substance.fema_number}</p>}
          {substance.odor && (
            <p className="truncate">Odor: {substance.odor}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/substances/${substance.substance_id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeedbackCard({
  feedback,
}: {
  feedback: SubstanceFeedback & { substance_name: string };
}) {
  const typeLabels: Record<string, string> = {
    error_report: "Error Report",
    change_request: "Change Request",
    data_enhancement: "Enhancement",
    general: "General",
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg truncate">
              {feedback.substance_name}
            </CardTitle>
            <Badge variant="outline" className="mt-1">
              {typeLabels[feedback.feedback_type] || feedback.feedback_type}
            </Badge>
          </div>
          {getFeedbackBadge(feedback.status)}
        </div>
        <CardDescription>
          Submitted {formatRelativeTime(feedback.submitted_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {feedback.commentary}
        </p>
        {feedback.resolution && (
          <div className="mt-2 p-2 bg-muted rounded text-sm">
            <strong>Resolution:</strong> {feedback.resolution}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export default function ContributePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Substance[]>([]);
  const [feedback, setFeedback] = useState<
    (SubstanceFeedback & { substance_name: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submissions");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [submissionsData, feedbackData] = await Promise.all([
        getUserSubmissions(),
        getUserFeedback(),
      ]);
      setSubmissions(submissionsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isSignedIn, isLoaded, router, fetchData]);

  if (!isLoaded || !isSignedIn) return null;

  const pendingSubmissions = submissions.filter(
    (s) => s.verification_status !== "verified"
  );
  const verifiedSubmissions = submissions.filter(
    (s) => s.verification_status === "verified"
  );
  const pendingFeedback = feedback.filter(
    (f) => f.status === "pending" || f.status === "under_review"
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Contributions</h1>
          <p className="text-muted-foreground mt-1">
            Submit new substances and report issues on existing data
          </p>
        </div>
        <Button onClick={() => router.push("/contribute/submit")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit Substance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Submitted Substances
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingSubmissions.length} pending, {verifiedSubmissions.length}{" "}
              verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Feedback Submitted
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingFeedback.length} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Contributions
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Added to official database
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="submissions"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="submissions">
            <FlaskConical className="mr-2 h-4 w-4" />
            My Substances ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="mr-2 h-4 w-4" />
            My Feedback ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : submissions.length > 0 ? (
              submissions.map((sub) => (
                <SubmissionCard key={sub.substance_id} substance={sub} />
              ))
            ) : (
              <Card className="col-span-full p-8 text-center">
                <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any substances yet.
                </p>
                <Button onClick={() => router.push("/contribute/submit")}>
                  Submit your first substance
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : feedback.length > 0 ? (
              feedback.map((fb) => (
                <FeedbackCard key={fb.feedback_id} feedback={fb} />
              ))
            ) : (
              <Card className="col-span-full p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any feedback yet. Found an error or have
                  a suggestion for an existing substance?
                </p>
                <Button onClick={() => router.push("/substances")}>
                  Browse substances
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

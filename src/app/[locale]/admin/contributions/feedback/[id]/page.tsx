"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Label } from "@/app/[locale]/components/ui/label";
import { Checkbox } from "@/app/[locale]/components/ui/checkbox";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Alert, AlertDescription } from "@/app/[locale]/components/ui/alert";
import {
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import {
  getFeedbackForReview,
  updateFeedbackStatus,
  resolveFeedbackWithChange,
  type FeedbackWithDetails,
} from "@/actions/admin/contributions";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
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

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    error_report: "bg-red-50 text-red-700 border-red-200",
    change_request: "bg-blue-50 text-blue-700 border-blue-200",
    data_enhancement: "bg-purple-50 text-purple-700 border-purple-200",
    general: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const labels: Record<string, string> = {
    error_report: "Error Report",
    change_request: "Change Request",
    data_enhancement: "Data Enhancement",
    general: "General Feedback",
  };

  return (
    <Badge variant="outline" className={colors[type] || ""}>
      {labels[type] || type}
    </Badge>
  );
}

export default function AdminFeedbackReviewPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = parseInt(params.id as string);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;

  const [feedback, setFeedback] = useState<FeedbackWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [applyChange, setApplyChange] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFeedbackForReview(feedbackId);
      if (!data) {
        setError("Feedback not found");
        return;
      }
      setFeedback(data);
      setAdminNotes(data.admin_notes || "");
    } catch (e) {
      console.error("Error fetching feedback:", e);
      setError(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, [feedbackId]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn && feedbackId) {
      fetchFeedback();
    }
  }, [isSignedIn, isLoaded, router, feedbackId, fetchFeedback]);

  const handleMarkUnderReview = async () => {
    setIsProcessing(true);
    try {
      await updateFeedbackStatus(feedbackId, "under_review", adminNotes || undefined);
      await fetchFeedback();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution || resolution.trim().length < 5) {
      setError("Please provide a resolution description (at least 5 characters)");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await resolveFeedbackWithChange(
        feedbackId,
        applyChange,
        resolution,
        adminNotes || undefined
      );

      if (result.substanceUpdated) {
        alert("Feedback resolved and the suggested change was applied to the substance.");
      }

      router.push("/admin/contributions/feedback?resolved=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resolve feedback");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!resolution || resolution.trim().length < 5) {
      setError("Please provide a rejection reason (at least 5 characters)");
      return;
    }

    setIsProcessing(true);
    try {
      await updateFeedbackStatus(feedbackId, "rejected", adminNotes || undefined, resolution);
      router.push("/admin/contributions/feedback?rejected=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject feedback");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkDuplicate = async () => {
    setIsProcessing(true);
    try {
      await updateFeedbackStatus(feedbackId, "duplicate", adminNotes || undefined, resolution || "Marked as duplicate");
      router.push("/admin/contributions/feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as duplicate");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  const canApplyChange =
    feedback?.feedback_type === "change_request" &&
    feedback?.target_field &&
    feedback?.suggested_value;

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to feedback
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : feedback ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Feedback on: {feedback.substance_name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(feedback.status)}
                {getTypeBadge(feedback.feedback_type)}
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted by:</span>
                <span>{feedback.submitter_username || "Unknown"}</span>
                {feedback.submitter_email && (
                  <span className="text-muted-foreground">
                    ({feedback.submitter_email})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span>{formatDate(feedback.submitted_at)}</span>
              </div>
              {feedback.source_reference && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span>{feedback.source_reference}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Content */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Commentary</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">
                  {feedback.commentary}
                </p>
              </div>

              {feedback.target_field && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Target Field</Label>
                    <p className="mt-1 font-medium">{feedback.target_field}</p>
                  </div>
                  {feedback.current_value && (
                    <div>
                      <Label className="text-muted-foreground">
                        Current Value
                      </Label>
                      <p className="mt-1 p-2 bg-red-50 text-red-700 rounded border border-red-200">
                        {feedback.current_value}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {feedback.suggested_value && (
                <div>
                  <Label className="text-muted-foreground">Suggested Value</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {feedback.current_value && (
                      <>
                        <span className="p-2 bg-red-50 text-red-700 rounded border border-red-200 line-through">
                          {feedback.current_value}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                    <span className="p-2 bg-green-50 text-green-700 rounded border border-green-200">
                      {feedback.suggested_value}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {feedback.status !== "resolved" && feedback.status !== "rejected" && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>
                  Review the feedback and take appropriate action
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    placeholder="Add internal notes about this feedback..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution">
                    Resolution / Response{" "}
                    <span className="text-muted-foreground">(required for resolve/reject)</span>
                  </Label>
                  <Textarea
                    id="resolution"
                    placeholder="Describe how this feedback was handled..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                  />
                </div>

                {canApplyChange && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                    <Checkbox
                      id="apply_change"
                      checked={applyChange}
                      onCheckedChange={(checked) =>
                        setApplyChange(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="apply_change"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Apply the suggested change to the substance
                    </label>
                  </div>
                )}

                <div className="flex gap-3 flex-wrap pt-2">
                  {feedback.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={handleMarkUnderReview}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      Mark Under Review
                    </Button>
                  )}

                  <Button
                    onClick={handleResolve}
                    disabled={isProcessing || resolution.length < 5}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Resolve{applyChange ? " & Apply Change" : ""}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleMarkDuplicate}
                    disabled={isProcessing}
                  >
                    Mark as Duplicate
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing || resolution.length < 5}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already resolved/rejected */}
          {(feedback.status === "resolved" || feedback.status === "rejected") && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.reviewed_by_admin_email && (
                  <p className="text-sm text-muted-foreground">
                    Reviewed by: {feedback.reviewed_by_admin_email}
                  </p>
                )}
                {feedback.resolution && (
                  <div>
                    <Label className="text-muted-foreground">Resolution</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md">
                      {feedback.resolution}
                    </p>
                  </div>
                )}
                {feedback.admin_notes && (
                  <div>
                    <Label className="text-muted-foreground">Admin Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md">
                      {feedback.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Feedback not found</p>
        </Card>
      )}
    </div>
  );
}

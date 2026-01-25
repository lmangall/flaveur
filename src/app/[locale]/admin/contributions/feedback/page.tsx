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
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getPendingFeedback,
  type FeedbackWithDetails,
} from "@/actions/admin/contributions";
import type { FeedbackStatusValue } from "@/constants";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    error_report: "bg-red-50 text-red-700",
    change_request: "bg-blue-50 text-blue-700",
    data_enhancement: "bg-purple-50 text-purple-700",
    general: "bg-gray-50 text-gray-700",
  };
  const labels: Record<string, string> = {
    error_report: "Error",
    change_request: "Change",
    data_enhancement: "Enhancement",
    general: "General",
  };

  return (
    <Badge variant="outline" className={colors[type] || ""}>
      {labels[type] || type}
    </Badge>
  );
}

export default function AdminFeedbackPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filter =
        statusFilter === "all"
          ? undefined
          : (statusFilter as FeedbackStatusValue);
      const data = await getPendingFeedback(filter);
      setFeedback(data);
    } catch (e) {
      console.error("Error fetching feedback:", e);
      setError(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchFeedback();
    }
  }, [isSignedIn, isLoaded, router, fetchFeedback]);

  if (!isLoaded || !isSignedIn) return null;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feedback & Corrections
          </h1>
          <p className="text-muted-foreground mt-1">
            Review user-reported issues and suggestions
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback ({feedback.length})</CardTitle>
          <CardDescription>
            Click on feedback to review and respond
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback matching the filter
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Substance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((fb) => (
                  <TableRow key={fb.feedback_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fb.substance_name}</div>
                        {fb.target_field && (
                          <div className="text-xs text-muted-foreground">
                            Field: {fb.target_field}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(fb.feedback_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{fb.submitter_username || "Unknown"}</div>
                        <div className="text-muted-foreground text-xs">
                          {fb.submitter_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(fb.submitted_at)}</TableCell>
                    <TableCell>{getStatusBadge(fb.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link
                          href={`/admin/contributions/feedback/${fb.feedback_id}`}
                        >
                          Review
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

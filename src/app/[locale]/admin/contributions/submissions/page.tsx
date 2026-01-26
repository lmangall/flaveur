"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
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
  ExternalLink,
} from "lucide-react";
import {
  getPendingSubstances,
  type PendingSubstanceWithUser,
} from "@/actions/admin/contributions";

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
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

export default function AdminSubmissionsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const isSignedIn = !!session;
  const isLoaded = !isPending;
  const [submissions, setSubmissions] = useState<PendingSubstanceWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filter =
        statusFilter === "all"
          ? undefined
          : (statusFilter as "user_entry" | "under_review");
      const data = await getPendingSubstances(filter);
      setSubmissions(data);
    } catch (e) {
      console.error("Error fetching submissions:", e);
      setError(e instanceof Error ? e.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchSubmissions();
    }
  }, [isSignedIn, isLoaded, router, fetchSubmissions]);

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
            Substance Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and verify user-submitted substances
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pending</SelectItem>
            <SelectItem value="user_entry">New submissions</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions ({submissions.length})</CardTitle>
          <CardDescription>
            Click on a submission to review and verify it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending submissions to review
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Substance</TableHead>
                  <TableHead>Identifiers</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.substance_id}>
                    <TableCell className="font-medium">
                      {sub.common_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.cas_id && `CAS: ${sub.cas_id}`}
                      {sub.fema_number && ` FEMA: ${sub.fema_number}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{sub.submitter_username || "Unknown"}</div>
                        <div className="text-muted-foreground text-xs">
                          {sub.submitter_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(sub.submitted_at)}</TableCell>
                    <TableCell>{getStatusBadge(sub.verification_status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link
                          href={`/admin/contributions/submissions/${sub.substance_id}`}
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

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
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  FlaskConical,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  getContributionStats,
  type ContributionStats,
} from "@/actions/admin/contributions";

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function AdminContributionsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getContributionStats();
      setStats(data);
    } catch (e) {
      console.error("Error fetching contribution stats:", e);
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn, isLoaded, router, fetchStats]);

  if (!isLoaded || !isSignedIn) return null;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
        <Card className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            You may not have admin access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
        <p className="text-muted-foreground mt-1">
          Review user-submitted substances and feedback
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Submissions
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.submissions.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.submissions.under_review} under review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Feedback
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.feedback.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.feedback.under_review} under review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Verified Substances
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.submissions.verified}
                </div>
                <p className="text-xs text-muted-foreground">
                  From user contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submissions
                </CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.submissions.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time contributions
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Substance Submissions
            </CardTitle>
            <CardDescription>
              Review new substances submitted by users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  {stats?.submissions.pending || 0} pending
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  {stats?.submissions.under_review || 0} reviewing
                </span>
              </div>
              <Button asChild>
                <Link href="/admin/contributions/submissions">
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback & Corrections
            </CardTitle>
            <CardDescription>
              Address reported issues and suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  {stats?.feedback.pending || 0} pending
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {stats?.feedback.resolved || 0} resolved
                </span>
              </div>
              <Button asChild>
                <Link href="/admin/contributions/feedback">
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      {stats && stats.topContributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Contributors
            </CardTitle>
            <CardDescription>
              Users with the most substance submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topContributors.map((contributor, index) => (
                <div
                  key={contributor.user_id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{contributor.username}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>
                      {contributor.submissions} submission
                      {contributor.submissions !== 1 ? "s" : ""}
                    </span>
                    <span className="text-green-600">
                      {contributor.verified} verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

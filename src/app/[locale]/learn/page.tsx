"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  GraduationCap,
  Plus,
  ArrowRight,
  Brain,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Repeat,
  Award,
} from "lucide-react";

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
import { Progress } from "@/app/[locale]/components/ui/progress";
import {
  getLearningDashboardStats,
  getMyLearningQueue,
  getDueReviews,
} from "@/actions/learning";
import type { LearningDashboardStats, LearningQueueItem, LearningReview } from "@/app/type";

export default function LearnDashboardPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations("Learn");
  const locale = useLocale();
  const router = useRouter();

  const [stats, setStats] = useState<LearningDashboardStats | null>(null);
  const [queue, setQueue] = useState<LearningQueueItem[]>([]);
  const [dueReviews, setDueReviews] = useState<LearningReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, queueData, reviewsData] = await Promise.all([
        getLearningDashboardStats(),
        getMyLearningQueue(),
        getDueReviews(),
      ]);
      setStats(statsData);
      setQueue(queueData);
      setDueReviews(reviewsData);
    } catch (error) {
      console.error("Failed to fetch learning data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      fetchData();
    }
  }, [isPending, session, fetchData]);

  if (isPending || isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("signInRequired") || "Sign in required"}</CardTitle>
            <CardDescription>
              {t("signInDescription") || "Please sign in to access the learning features."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/${locale}/auth/sign-in`)}>
              {t("signIn") || "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalProgress = stats
    ? stats.not_started + stats.learning + stats.confident + stats.mastered
    : 0;
  const masteredPercentage = totalProgress > 0 && stats
    ? Math.round((stats.mastered / totalProgress) * 100)
    : 0;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="h-8 w-8" />
          {t("title") || "Flavor Learning"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("subtitle") || "Master sensory identification of flavor substances"}
        </p>
      </div>

      {/* How it works section */}
      <Card className="mb-8">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t("howItWorksTitle") || "How does it work?"}</CardTitle>
            </div>
            {showHowItWorks ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {showHowItWorks && (
          <CardContent className="pt-0">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary shrink-0" />
                  {t("step1Title") || "1. Build your queue"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("step1Description") || "Browse substances and add the ones you want to learn to your queue. Start with common aroma chemicals."}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-primary shrink-0" />
                  {t("step2Title") || "2. Practice identification"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("step2Description") || "Smell and taste each substance. Check off your sensory experiences and add personal notes to remember key characteristics."}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1.5">
                  <Repeat className="h-4 w-4 text-primary shrink-0" />
                  {t("step3Title") || "3. Review & master"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("step3Description") || "Progress through levels: Learning → Confident → Mastered. Spaced repetition reviews help you retain what you've learned."}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <Award className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t("tipTitle") || "Pro tip:"}</span>{" "}
                {t("tipDescription") || "Keep a physical kit of aroma chemicals nearby. The best way to learn is by experiencing the real thing while studying the data."}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("currentStreak") || "Current Streak"}
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.current_streak || 0} days</div>
            <p className="text-xs text-muted-foreground">
              {t("longestStreak") || "Longest"}: {stats?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>

        {/* Mastered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("mastered") || "Mastered"}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mastered || 0}</div>
            <Progress value={masteredPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {masteredPercentage}% {t("ofTotal") || "of total"}
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inProgress") || "In Progress"}
            </CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.learning || 0) + (stats?.confident || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.learning || 0} {t("learning") || "learning"}, {stats?.confident || 0} {t("confident") || "confident"}
            </p>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("badges") || "Badges"}
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.badges_earned || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("badgesEarned") || "Badges earned"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Queue Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>{t("learningQueue") || "Learning Queue"}</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/${locale}/learn/queue`)}
              >
                {t("viewAll") || "View All"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>
              {t("queueDescription") || "Substances you're learning"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  {t("emptyQueue") || "Your learning queue is empty"}
                </p>
                <Button onClick={() => router.push(`/${locale}/substances`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("browseSubstances") || "Browse Substances"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.slice(0, 5).map((item) => (
                  <div
                    key={item.queue_id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/${locale}/learn/${item.substance_id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {item.substance?.common_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        FEMA #{item.substance?.fema_number}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.progress_status === "mastered"
                          ? "default"
                          : item.progress_status === "confident"
                            ? "secondary"
                            : "outline"
                      }
                      className="ml-2"
                    >
                      {item.progress_status}
                    </Badge>
                  </div>
                ))}
                {queue.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    +{queue.length - 5} {t("more") || "more"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>{t("dueReviews") || "Due Reviews"}</CardTitle>
              </div>
              {dueReviews.length > 0 && (
                <Badge variant="destructive">{dueReviews.length}</Badge>
              )}
            </div>
            <CardDescription>
              {t("reviewsDescription") || "Spaced repetition reviews"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dueReviews.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
                <p className="text-muted-foreground">
                  {t("noReviewsDue") || "No reviews due! You're all caught up."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.review_id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/${locale}/learn/${review.substance_id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {review.substance?.common_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("scheduledFor") || "Scheduled"}: {new Date(review.scheduled_for).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("review") || "Review"}
                    </Button>
                  </div>
                ))}
                {dueReviews.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    +{dueReviews.length - 5} {t("more") || "more"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button onClick={() => router.push(`/${locale}/learn/queue`)}>
          <BookOpen className="h-4 w-4 mr-2" />
          {t("manageQueue") || "Manage Queue"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/${locale}/substances`)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addSubstances") || "Add Substances"}
        </Button>
      </div>
    </div>
  );
}

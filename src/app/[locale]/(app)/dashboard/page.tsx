"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  FolderTree,
  Clock,
  Database,
  Globe,
  Users,
  Briefcase,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Brain,
  Trophy,
  Flame,
  Bell,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout";
import {
  EmptyFlavors,
  EmptyFavorites,
  EmptyPublicFlavors,
  EmptySharedWithMe,
} from "@/app/[locale]/components/ui/empty-state";
import {
  getDashboardStats,
  getRecentFlavors,
  getFavoriteFlavors,
  getPublicFlavors,
  getTopSubstances,
  type DashboardStats,
  type RecentFlavor,
  type TopSubstance,
} from "@/actions/dashboard";
import { getFormulasSharedWithMe, type SharedFormula } from "@/actions/shares";
import { getLearningDashboardStats } from "@/actions/learning";
import type { LearningDashboardStats } from "@/app/type";
import { getRandomFact, type AromeFact } from "@/constants/arome-facts";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return date.toLocaleDateString();
}

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

function FlavorCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-5 w-20" />
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <Skeleton className="h-8 w-24 ml-auto" />
      </CardFooter>
    </Card>
  );
}

function InsightCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function DidYouKnowCard() {
  const t = useTranslations("Dashboard");
  const [fact, setFact] = useState<AromeFact>(() => getRandomFact());

  return (
    <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          {t("didYouKnow")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{fact.content}</p>
        {fact.molecule && (
          <Badge variant="outline" className="mt-3 text-xs">
            {fact.molecule}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFact(getRandomFact())}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          {t("anotherFact")}
        </Button>
      </CardFooter>
    </Card>
  );
}

function TopSubstancesCard({ substances, isLoading }: { substances: TopSubstance[]; isLoading: boolean }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  if (isLoading) {
    return <InsightCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          {t("topSubstances")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {substances.length > 0 ? (
          <ul className="space-y-2">
            {substances.map((substance, index) => (
              <li key={substance.substance_id} className="flex items-center justify-between">
                <Link
                  href={`/substances/${substance.substance_id}`}
                  className="text-sm hover:underline truncate flex-1 mr-2"
                >
                  <span className="text-muted-foreground mr-2">{index + 1}.</span>
                  {substance.common_name}
                </Link>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("usedInFormulas", { count: substance.usage_count })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{t("noSubstancesYet")}</p>
            <p className="text-xs text-muted-foreground">{t("createFirstFormula")}</p>
          </div>
        )}
      </CardContent>
      {substances.length > 0 && (
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/substances">View All Substances</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function LearningOnboardingCard() {
  const t = useTranslations("Dashboard");

  return (
    <Card className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50 dark:border-purple-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {t("startLearning")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("learnDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            {t("learnBenefit1")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            {t("learnBenefit2")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            {t("learnBenefit3")}
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button size="sm" asChild className="w-full">
          <Link href="/learn">{t("exploreLearning")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function LearningProgressCard({ stats }: { stats: LearningDashboardStats }) {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {t("startLearning")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-lg font-bold">{stats.mastered}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {t("substancesMastered")}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-lg font-bold">{stats.current_streak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {t("currentStreak")}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bell className={`h-3.5 w-3.5 ${stats.reviews_due > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={`text-lg font-bold ${stats.reviews_due > 0 ? "text-red-600" : ""}`}>
                {stats.reviews_due}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {t("reviewsDue")}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/learn">{t("continueLearning")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function LearningCard({ stats, isLoading }: { stats: LearningDashboardStats | null; isLoading: boolean }) {
  if (isLoading) {
    return <InsightCardSkeleton />;
  }

  const hasStartedLearning = stats && (
    stats.total_in_queue > 0 ||
    stats.mastered > 0 ||
    stats.learning > 0 ||
    stats.confident > 0
  );

  if (!hasStartedLearning) {
    return <LearningOnboardingCard />;
  }

  return <LearningProgressCard stats={stats!} />;
}

function FlavorCard({ flavor }: { flavor: RecentFlavor }) {
  const t = useTranslations("Dashboard");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "draft":
        return <Badge variant="warning">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className={`overflow-hidden ${flavor.status === "draft" ? "opacity-80" : ""}`}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{flavor.name}</CardTitle>
          {flavor.is_public && (
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
          )}
        </div>
        <CardDescription>Updated {formatRelativeTime(flavor.updated_at)}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex items-center justify-between">
        {getStatusBadge(flavor.status)}
        <span className="text-xs text-muted-foreground">
          {flavor.substance_count} substance{flavor.substance_count !== 1 ? "s" : ""}
        </span>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/formulas/${flavor.formula_id}`}>{t("viewDetails")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function SharedFlavorCard({ flavor }: { flavor: SharedFormula }) {
  const t = useTranslations("Dashboard");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{flavor.name}</CardTitle>
          <Users className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
        </div>
        <CardDescription>
          {t("sharedBy")} {flavor.shared_by.username || flavor.shared_by.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex items-center justify-between">
        <Badge variant="secondary">{t("viewOnly")}</Badge>
        <span className="text-xs text-muted-foreground">
          {flavor.substance_count} substance{flavor.substance_count !== 1 ? "s" : ""}
        </span>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/formulas/${flavor.formula_id}`}>{t("viewDetails")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topSubstances, setTopSubstances] = useState<TopSubstance[]>([]);
  const [learningStats, setLearningStats] = useState<LearningDashboardStats | null>(null);
  const [recentFlavors, setRecentFlavors] = useState<RecentFlavor[]>([]);
  const [favoriteFlavors, setFavoriteFlavors] = useState<RecentFlavor[]>([]);
  const [publicFlavors, setPublicFlavorsState] = useState<RecentFlavor[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedFormula[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingFlavors, setIsLoadingFlavors] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setIsLoadingFlavors(true);
      setIsLoadingInsights(true);

      const [statsData, recentData, topSubstancesData, learningData] = await Promise.all([
        getDashboardStats(),
        getRecentFlavors(6),
        getTopSubstances(5),
        getLearningDashboardStats(),
      ]);

      setStats(statsData);
      setRecentFlavors(recentData);
      setTopSubstances(topSubstancesData);
      setLearningStats(learningData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingFlavors(false);
      setIsLoadingInsights(false);
    }
  }, []);

  const fetchTabData = useCallback(async (tab: string) => {
    if (tab === "favorites" && favoriteFlavors.length === 0) {
      try {
        const data = await getFavoriteFlavors(6);
        setFavoriteFlavors(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    } else if (tab === "public" && publicFlavors.length === 0) {
      try {
        const data = await getPublicFlavors(6);
        setPublicFlavorsState(data);
      } catch (error) {
        console.error("Error fetching public flavors:", error);
      }
    } else if (tab === "shared" && sharedWithMe.length === 0) {
      try {
        const data = await getFormulasSharedWithMe();
        setSharedWithMe(data);
      } catch (error) {
        console.error("Error fetching shared flavors:", error);
      }
    }
  }, [favoriteFlavors.length, publicFlavors.length, sharedWithMe.length]);

  useEffect(() => {
    if (isPending) return;
    if (session) {
      fetchData();
    }
  }, [session, isPending, fetchData]);

  useEffect(() => {
    if (session && activeTab !== "recent") {
      fetchTabData(activeTab);
    }
  }, [activeTab, session, fetchTabData]);

  if (isPending || !session) return null;

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={() => router.push("/formulas/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("newFlavor")}
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("myFlavors")}</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalFlavors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.publishedFlavors || 0} {t("published")}, {stats?.draftFlavors || 0} {t("drafts")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("publicFlavors")}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.publicFlavors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t("visibleToCommunity")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("substances")}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSubstances || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t("availableInDatabase")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("categories")}</CardTitle>
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t("forOrganizingFlavors")}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Did You Know? Card */}
      <DidYouKnowCard />

      {/* Insights Grid: Top Substances + Learning */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopSubstancesCard substances={topSubstances} isLoading={isLoadingInsights} />
        <LearningCard stats={learningStats} isLoading={isLoadingInsights} />
      </div>

      {/* Job Opportunities CTA */}
      <Card className="bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t("jobOpportunities")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("exploreCareerOpportunities")}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/jobs">
              {t("browseJobs")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Flavor Tabs */}
      <Tabs
        defaultValue="recent"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            {t("recent")}
          </TabsTrigger>
          <TabsTrigger value="favorites">{t("favorites")}</TabsTrigger>
          <TabsTrigger value="public">
            <Globe className="mr-2 h-4 w-4" />
            {t("public")}
          </TabsTrigger>
          <TabsTrigger value="shared">
            <Users className="mr-2 h-4 w-4" />
            {t("sharedWithMe")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingFlavors ? (
              <>
                <FlavorCardSkeleton />
                <FlavorCardSkeleton />
                <FlavorCardSkeleton />
              </>
            ) : recentFlavors.length > 0 ? (
              recentFlavors.map((flavor) => (
                <FlavorCard key={flavor.formula_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyFlavors onCreateClick={() => router.push("/formulas/new")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteFlavors.length > 0 ? (
              favoriteFlavors.map((flavor) => (
                <FlavorCard key={flavor.formula_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyFavorites onBrowseClick={() => router.push("/formulas")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicFlavors.length > 0 ? (
              publicFlavors.map((flavor) => (
                <FlavorCard key={flavor.formula_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyPublicFlavors onManageClick={() => router.push("/formulas")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedWithMe.length > 0 ? (
              sharedWithMe.map((flavor) => (
                <SharedFlavorCard key={flavor.formula_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptySharedWithMe />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

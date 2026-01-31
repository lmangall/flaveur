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
  type DashboardStats,
  type RecentFlavor,
} from "@/actions/dashboard";
import { getFlavoursSharedWithMe, type SharedFlavour } from "@/actions/shares";

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

function FlavorCard({ flavor }: { flavor: RecentFlavor }) {
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
          <Link href={`/flavours/${flavor.flavour_id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function SharedFlavorCard({ flavor }: { flavor: SharedFlavour }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{flavor.name}</CardTitle>
          <Users className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
        </div>
        <CardDescription>
          Shared by {flavor.shared_by.username || flavor.shared_by.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex items-center justify-between">
        <Badge variant="secondary">View only</Badge>
        <span className="text-xs text-muted-foreground">
          {flavor.substance_count} substance{flavor.substance_count !== 1 ? "s" : ""}
        </span>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <Button variant="ghost" size="sm" asChild className="ml-auto">
          <Link href={`/flavours/${flavor.flavour_id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFlavors, setRecentFlavors] = useState<RecentFlavor[]>([]);
  const [favoriteFlavors, setFavoriteFlavors] = useState<RecentFlavor[]>([]);
  const [publicFlavors, setPublicFlavorsState] = useState<RecentFlavor[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedFlavour[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingFlavors, setIsLoadingFlavors] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setIsLoadingFlavors(true);

      const [statsData, recentData] = await Promise.all([
        getDashboardStats(),
        getRecentFlavors(6),
      ]);

      setStats(statsData);
      setRecentFlavors(recentData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingFlavors(false);
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
        const data = await getFlavoursSharedWithMe();
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
        title="Dashboard"
        subtitle="Overview of your flavor compositions and activity"
        actions={
          <Button onClick={() => router.push("/flavours/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Flavor
          </Button>
        }
      />

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
                <CardTitle className="text-sm font-medium">My Flavors</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalFlavors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.publishedFlavors || 0} published, {stats?.draftFlavors || 0} drafts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Flavors</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.publicFlavors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Visible to community
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Substances</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSubstances || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available in database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
                <p className="text-xs text-muted-foreground">
                  For organizing flavors
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs
        defaultValue="recent"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="public">
            <Globe className="mr-2 h-4 w-4" />
            Public
          </TabsTrigger>
          <TabsTrigger value="shared">
            <Users className="mr-2 h-4 w-4" />
            Shared with me
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
                <FlavorCard key={flavor.flavour_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyFlavors onCreateClick={() => router.push("/flavours/new")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteFlavors.length > 0 ? (
              favoriteFlavors.map((flavor) => (
                <FlavorCard key={flavor.flavour_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyFavorites onBrowseClick={() => router.push("/flavours")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicFlavors.length > 0 ? (
              publicFlavors.map((flavor) => (
                <FlavorCard key={flavor.flavour_id} flavor={flavor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyPublicFlavors onManageClick={() => router.push("/flavours")} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedWithMe.length > 0 ? (
              sharedWithMe.map((flavor) => (
                <SharedFlavorCard key={flavor.flavour_id} flavor={flavor} />
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

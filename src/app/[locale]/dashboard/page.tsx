"use client";

import { useEffect, useState } from "react";
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
import { PlusCircle, FlaskConical, FolderTree, Clock } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/[locale]/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { toast } from "sonner";

type Flavor = {
  id: number;
  name: string;
  status: string;
  updatedAt: string;
};

type DashboardData = {
  totalFlavors: number;
  publicFlavors: number;
  substances: number;
  categories: number;
  updatedAt: string;
};

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [recentFlavors, setRecentFlavors] = useState<Flavor[]>([]);
  const [stats, setStats] = useState<DashboardData>({
    totalFlavors: 0,
    publicFlavors: 0,
    substances: 0,
    categories: 0,
    updatedAt: "",
  });

  // Show toast on any click on the page
  const handlePageClick = () => {
    toast("This feature is under development", {
      // description: "Sorry for the inconvenience",
      style: {
        background: "white", // red background
        color: "red", // white text
      },
    });
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      // Fetch data here in a real app
      setRecentFlavors([
        {
          id: 1,
          name: "Vanilla Bean Blend",
          status: "published",
          updatedAt: "2 days ago",
        },
        {
          id: 2,
          name: "Citrus Explosion",
          status: "draft", // dev feature (draft) status
          updatedAt: "5 days ago",
        },
        {
          id: 3,
          name: "Cherry Cola",
          status: "published",
          updatedAt: "1 week ago",
        },
      ]);

      setStats({
        totalFlavors: 12,
        publicFlavors: 8,
        substances: 245,
        categories: 18,
        updatedAt: "30 days ago",
      });
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div
      className="space-y-8 opacity-50"
      onClick={handlePageClick} // Attach click handler for the entire page
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => router.push("/flavours/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Flavor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flavors</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlavors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publicFlavors} public
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Substances Used
            </CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.substances}</div>
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
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              For organizing flavors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentFlavors.length > 0 ? recentFlavors.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentFlavors.map((flavor) => (
              <Card
                key={flavor.id}
                className={`overflow-hidden ${
                  flavor.status === "draft" ? "opacity-70" : ""
                }`} // Lower opacity for draft status
              >
                <Tooltip>
                  <div className="w-full">
                    <TooltipTrigger>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{flavor.name}</CardTitle>
                        <CardDescription>
                          Updated {flavor.updatedAt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            flavor.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {flavor.status.charAt(0).toUpperCase() +
                            flavor.status.slice(1)}
                        </span>
                      </CardContent>
                    </TooltipTrigger>
                    <CardFooter className="p-4 border-t bg-muted/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="ml-auto"
                      >
                        <Link href={`/flavours/${flavor.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                  {flavor.status === "draft" && (
                    <TooltipContent>
                      <p>Coming soon</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </Card>
            ))}
            {recentFlavors.length === 0 && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  You don&apos;t have any recent flavors.
                </p>
                <Button
                  onClick={() => router.push("/flavours/new")}
                  className="mt-4"
                >
                  Create your first flavor
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="favorites">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any favorite flavors yet.
            </p>
            <Button onClick={() => router.push("/flavours")} className="mt-4">
              Browse your flavors
            </Button>
          </Card>
        </TabsContent>
        <TabsContent value="public">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              You &apos;t have any public flavors.
            </p>
            <Button onClick={() => router.push("/flavours")} className="mt-4">
              Manage your flavors
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

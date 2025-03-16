"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Filter,
  Star,
  StarOff,
} from "lucide-react";

type Flavour = {
  id: number;
  name: string;
  description: string;
  status: string;
  category: string;
  unit: string;
  createdAt: string;
  isPublic: boolean;
  version: number;
};

type ApiFlavour = {
  flavour_id: number; // Adjust the type based on your API response
  name?: string;
  description?: string;
  status?: string;
  category_id?: number;
  base_unit?: string;
  created_at?: string;
  is_public?: boolean;
  version?: number;
};

function FlavourCard({ flavour }: { flavour: Flavour }) {
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState([
    { attribute: "Sweetness", value: 50 },
    { attribute: "Sourness", value: 50 },
    { attribute: "Bitterness", value: 50 },
    { attribute: "Umami", value: 50 },
    { attribute: "Saltiness", value: 50 },
  ]);

  const router = useRouter();

  const handleChange = (index: number, newValue: number) => {
    setChartData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
    );
  };

  const chartConfig = {
    value: {
      label: "Intensity",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            <Link href={`/flavours/${flavour.id}`} className="hover:underline">
              {flavour.name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show Profile</span>
            <Switch checked={showChart} onCheckedChange={setShowChart} />
          </div>
        </div>
        <CardDescription>Version {flavour.version}</CardDescription>
      </CardHeader>
      <CardContent>
        {showChart ? (
          <div>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[200px]"
            >
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="attribute" />
                <Radar
                  dataKey="value"
                  fill="blue"
                  fillOpacity={0.6}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>

            {/* Input Fields for Custom Values */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <label className="text-sm font-medium w-1/2">
                    {item.attribute}
                  </label>
                  <Input
                    type="number"
                    value={item.value}
                    min={0}
                    max={100}
                    className="w-16 text-center"
                    onChange={(e) =>
                      handleChange(index, Number(e.target.value))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">{flavour.description || "No description"}</p>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(
                  flavour.status
                )}`}
              >
                {flavour.status.charAt(0).toUpperCase() +
                  flavour.status.slice(1)}
              </span>
              <span className="flex items-center gap-1 text-xs">
                {flavour.isPublic ? (
                  <>
                    <Star className="h-3 w-3 text-amber-500" /> Public
                  </>
                ) : (
                  <>
                    <StarOff className="h-3 w-3 text-muted-foreground" />{" "}
                    Private
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          {flavour.category}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/flavours/${flavour.id}`)}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/flavours/${flavour.id}/edit`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/flavours/${flavour.id}/duplicate`)}
            >
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-amber-100 text-amber-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function FlavoursPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth(); // Move useAuth here

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
      return;
    }

    // Fetch flavours from the API
    const fetchFlavours = async () => {
      try {
        const token = await getToken(); // Get Clerk token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flavours`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Map the API response to match our Flavour type
        // This fixes the property name mismatch between API and frontend
        const processedFlavours = data.map((item: ApiFlavour) => ({
          id: item.flavour_id, // Use flavour_id as id
          name: item.name || "Unnamed",
          description: item.description || "",
          status: item.status || "draft",
          category: item.category_id ? `Category ${item.category_id}` : "Other",
          unit: item.base_unit || "",
          createdAt: item.created_at || new Date().toISOString(),
          isPublic: !!item.is_public,
          version: item.version || 1,
        }));

        setFlavours(processedFlavours);
      } catch (error) {
        console.error("Failed to fetch flavours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlavours();
  }, [isSignedIn, router, getToken]);

  const filteredFlavours = flavours.filter((flavour) => {
    const matchesSearch = flavour.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || flavour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isSignedIn) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Flavors</h1>
        <Button onClick={() => router.push("/flavours/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Flavor
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flavors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredFlavours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlavours.map((flavour) => (
            <FlavourCard key={flavour.id} flavour={flavour} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No flavors found matching your criteria
          </p>
          <Button onClick={() => router.push("/flavours/new")}>
            Create a new flavor
          </Button>
        </div>
      )}
    </div>
  );
}

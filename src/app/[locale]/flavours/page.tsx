"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Switch } from "@/app/[locale]/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { PlusCircle, Search, MoreHorizontal, Filter } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/[locale]/components/ui/chart";
import { Flavour } from "@/app/type";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { getFlavours, duplicateFlavour, deleteFlavour } from "@/actions/flavours";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/[locale]/components/ui/alert-dialog";
import { toast } from "sonner";

// Flavor Profile Component
type FlavorProfileData = {
  attribute: string;
  value: number;
};

type RadarFlavorProfileProps = {
  initialData?: FlavorProfileData[];
  onSave?: (data: FlavorProfileData[]) => void;
  className?: string;
  translations: {
    save: string;
    intensity: string;
  };
};

function RadarFlavorProfile({
  initialData = [
    { attribute: "Sweetness", value: 50 },
    { attribute: "Sourness", value: 50 },
    { attribute: "Bitterness", value: 50 },
    { attribute: "Umami", value: 50 },
    { attribute: "Saltiness", value: 50 },
  ],
  onSave,
  className = "",
  translations,
}: RadarFlavorProfileProps) {
  const [chartData, setChartData] = useState<FlavorProfileData[]>(initialData);
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (index: number, newValue: number) => {
    setChartData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
    );
    setIsChanged(true);
  };

  const handleSaveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onSave) {
      onSave(chartData);
    }
    setIsChanged(false);
  };

  const chartConfig = {
    value: {
      label: translations.intensity,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Radar Chart */}
      <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
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
            dot={{ r: 4, fillOpacity: 1 }}
          />
        </RadarChart>
      </ChartContainer>

      {/* Adjusters */}
      <div className="flex flex-col gap-1 text-xs w-1/2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {/* Label */}
            <label className="w-3/5 text-right">{item.attribute}</label>

            {/* Editable Text */}
            <span
              contentEditable
              suppressContentEditableWarning
              className="w-12 px-1 py-0.5 text-center border rounded bg-muted/50"
              onBlur={(e) => handleChange(index, Number(e.target.textContent))}
            >
              {item.value}
            </span>
          </div>
        ))}
        {isChanged && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 self-end text-xs px-2 py-1"
            onClick={handleSaveButton}
          >
            {translations.save}
          </Button>
        )}
      </div>
    </div>
  );
}

// Flavour Card Component
type FlavourCardProps = {
  flavour: Flavour;
  translations: {
    showProfile: string;
    noDescription: string;
    public: string;
    private: string;
    category: string;
    none: string;
    view: string;
    edit: string;
    duplicate: string;
    delete: string;
    version: string;
    save: string;
    intensity: string;
  };
  onDuplicate: (flavourId: number) => void;
  onDelete: (flavour: Flavour) => void;
};

function FlavourCard({ flavour, translations, onDuplicate, onDelete }: FlavourCardProps) {
  const [showChart, setShowChart] = useState(false);
  const router = useRouter();

  const handleSaveProfile = (data: FlavorProfileData[]) => {
    console.log("Saving flavor profile for:", flavour.name, data);
    // Here you would implement the actual save logic to your backend
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            <Link
              href={`/flavours/${flavour.flavour_id}`}
              className="hover:underline"
            >
              {flavour.name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{translations.showProfile}</span>
            <Switch checked={showChart} onCheckedChange={setShowChart} />
          </div>
        </div>
        <CardDescription>{translations.version} {flavour.version}</CardDescription>
      </CardHeader>
      <CardContent>
        {showChart ? (
          <RadarFlavorProfile onSave={handleSaveProfile} translations={{ save: translations.save, intensity: translations.intensity }} />
        ) : (
          <div className="space-y-2">
            <p className="text-sm">{flavour.description || translations.noDescription}</p>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(
                  flavour.status || "draft"
                )}`}
              >
                {(flavour.status || "draft").charAt(0).toUpperCase() +
                  (flavour.status || "draft").slice(1)}
              </span>
              <Badge variant="outline">
                {flavour.is_public ? translations.public : translations.private}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="font-medium">{translations.category}:</span>{" "}
          {flavour.category_id || translations.none}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/flavours/${flavour.flavour_id}`)}
            >
              {translations.view}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/flavours/${flavour.flavour_id}/edit`)
              }
            >
              {translations.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate(flavour.flavour_id)}
            >
              {translations.duplicate}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(flavour)}
            >
              {translations.delete}
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

// Main Page Component
export default function FlavoursPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations("Flavours");
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFlavour, setDeletingFlavour] = useState<Flavour | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFlavoursData = async () => {
    try {
      const data = await getFlavours();

      // Map the API response to match our Flavour type
      const transformedData = (data as Array<{
        flavour_id: number;
        name: string;
        description: string;
        status: string;
        is_public: boolean;
        version: number | null;
        base_unit: string;
        category_id: number | null;
        created_at: string;
        updated_at: string;
        user_id: string;
        substances?: Array<{
          substance_id: number;
          concentration: number;
          unit: string;
          order_index: number;
        }>;
      }>).map(
        (item) =>
          ({
            flavour_id: item.flavour_id,
            name: item.name || "Unnamed",
            description: item.description || "",
            substances: item.substances || [],
            status: item.status || "draft",
            is_public: Boolean(item.is_public),
            version: item.version !== null ? Number(item.version) : null,
            base_unit: item.base_unit || "",
            category_id:
              item.category_id !== null ? Number(item.category_id) : null,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            user_id: item.user_id || "Unknown",
          } as Flavour)
      );

      setFlavours(transformedData);
    } catch (err) {
      console.error("Failed to fetch flavours:", err);
      setError(err instanceof Error ? err.message : "Failed to load flavours");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }
    fetchFlavoursData();
  }, [isLoaded, isSignedIn, router]);

  const handleDuplicate = async (flavourId: number) => {
    try {
      const newFlavour = await duplicateFlavour(flavourId);
      toast.success("Flavour duplicated successfully");
      // Navigate to the new flavour's edit page
      router.push(`/flavours/${newFlavour.flavour_id}/edit`);
    } catch (err) {
      console.error("Failed to duplicate flavour:", err);
      toast.error(err instanceof Error ? err.message : "Failed to duplicate flavour");
    }
  };

  const handleDelete = async () => {
    if (!deletingFlavour) return;

    setIsDeleting(true);
    try {
      await deleteFlavour(deletingFlavour.flavour_id);
      toast.success(`${deletingFlavour.name} has been deleted`);
      setDeletingFlavour(null);
      fetchFlavoursData();
    } catch (err) {
      console.error("Failed to delete flavour:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete flavour");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFlavours = flavours.filter((flavour) => {
    const matchesSearch = flavour.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || flavour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isLoaded || !isSignedIn) return null;

  const cardTranslations = {
    showProfile: t("showProfile"),
    noDescription: t("noDescription"),
    public: t("public"),
    private: t("private"),
    category: t("category"),
    none: t("none"),
    view: t("view"),
    edit: t("edit"),
    duplicate: t("duplicate"),
    delete: t("delete"),
    version: t("version"),
    save: t("save"),
    intensity: "Intensity",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("myFlavors")}</h1>
        <Button onClick={() => router.push("/flavours/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("newFlavor")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchFlavors")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="published">{t("published")}</SelectItem>
              <SelectItem value="draft">{t("draft")}</SelectItem>
              <SelectItem value="archived">{t("archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          <p className="font-medium">{t("errorLoading")}</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredFlavours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlavours.map((flavour) => (
            <FlavourCard
              key={flavour.flavour_id}
              flavour={flavour}
              translations={cardTranslations}
              onDuplicate={handleDuplicate}
              onDelete={setDeletingFlavour}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            {t("noFlavorsFound")}
          </p>
          <Button onClick={() => router.push("/flavours/new")}>
            {t("createNewFlavor")}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFlavour} onOpenChange={(open) => !open && setDeletingFlavour(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")} Flavour</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingFlavour?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

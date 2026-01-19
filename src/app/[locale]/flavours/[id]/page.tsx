"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Eye, EyeOff, ChevronDown, Trash2, Pencil, Copy, ArrowLeft, Plus, X, Save, Share2 } from "lucide-react";
import { Flavour, Substance, FlavorProfileAttribute } from "@/app/type";
import {
  getFlavourById,
  addSubstanceToFlavour,
  removeSubstanceFromFlavour,
  updateFlavourStatus,
  deleteFlavour,
  duplicateFlavour,
  updateFlavorProfile,
} from "@/actions/flavours";
import { Slider } from "@/app/[locale]/components/ui/slider";
import { Input } from "@/app/[locale]/components/ui/input";
import { getCategoryById } from "@/actions/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/[locale]/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/[locale]/components/ui/chart";
import { ShareFlavourDialog } from "@/app/[locale]/components/share-flavour-dialog";
import { useTranslations } from "next-intl";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", className: "bg-amber-100 text-amber-800" },
  { value: "published", label: "Published", className: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", className: "bg-gray-100 text-gray-800" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

// Default flavor profile data for radar chart
const DEFAULT_FLAVOR_PROFILE: FlavorProfileAttribute[] = [
  { attribute: "Sweetness", value: 50 },
  { attribute: "Sourness", value: 30 },
  { attribute: "Bitterness", value: 20 },
  { attribute: "Umami", value: 40 },
  { attribute: "Saltiness", value: 25 },
];

const chartConfig = {
  value: {
    label: "Intensity",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface FlavorProfileChartProps {
  flavourId: number;
  initialProfile: FlavorProfileAttribute[] | null;
  readOnly?: boolean;
}

function FlavorProfileChart({ flavourId, initialProfile, readOnly = false }: FlavorProfileChartProps) {
  const [profile, setProfile] = useState<FlavorProfileAttribute[]>(
    initialProfile && initialProfile.length > 0 ? initialProfile : DEFAULT_FLAVOR_PROFILE
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAttribute, setNewAttribute] = useState("");
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);

  const handleValueChange = (index: number, newValue: number) => {
    setProfile((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
    );
    setHasChanges(true);
  };

  const handleAttributeNameChange = (index: number, newName: string) => {
    setProfile((prev) =>
      prev.map((item, i) => (i === index ? { ...item, attribute: newName } : item))
    );
    setHasChanges(true);
  };

  const handleAddAttribute = () => {
    if (newAttribute.trim()) {
      setProfile((prev) => [...prev, { attribute: newAttribute.trim(), value: 50 }]);
      setNewAttribute("");
      setIsAddingAttribute(false);
      setHasChanges(true);
    }
  };

  const handleRemoveAttribute = (index: number) => {
    if (profile.length > 3) {
      setProfile((prev) => prev.filter((_, i) => i !== index));
      setHasChanges(true);
    } else {
      toast.error("Minimum 3 attributes required");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFlavorProfile(flavourId, profile);
      toast.success("Flavor profile saved");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving flavor profile:", error);
      toast.error("Failed to save flavor profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Radar Chart */}
        <div className="flex-shrink-0">
          <ChartContainer config={chartConfig} className="h-[250px] w-[300px]">
            <RadarChart data={profile}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarGrid />
              <PolarAngleAxis dataKey="attribute" />
              <Radar
                dataKey="value"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
                stroke="hsl(var(--primary))"
                dot={{ r: 4, fillOpacity: 1 }}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        {/* Attribute Controls */}
        <div className="flex-1 space-y-3">
          {profile.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {readOnly ? (
                <span className="w-28 text-sm font-medium">{item.attribute}</span>
              ) : (
                <Input
                  value={item.attribute}
                  onChange={(e) => handleAttributeNameChange(index, e.target.value)}
                  className="w-28 h-8 text-sm"
                />
              )}
              <Slider
                value={[item.value]}
                onValueChange={(values) => !readOnly && handleValueChange(index, values[0])}
                max={100}
                step={1}
                className="flex-1"
                disabled={readOnly}
              />
              <span className="w-8 text-sm text-right">{item.value}</span>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveAttribute(index)}
                  disabled={profile.length <= 3}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Add Attribute - only for owners */}
          {!readOnly && (
            <>
              {isAddingAttribute ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newAttribute}
                    onChange={(e) => setNewAttribute(e.target.value)}
                    placeholder="New attribute name"
                    className="flex-1 h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAttribute()}
                  />
                  <Button size="sm" onClick={handleAddAttribute}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingAttribute(false);
                      setNewAttribute("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingAttribute(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save Button - only for owners */}
      {!readOnly && hasChanges && (
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      )}
    </div>
  );
}

interface FlavorContentProps {
  flavor: Flavour;
  isOwner: boolean;
  isSharedWithMe: boolean;
  sharedBy?: { username: string | null; email: string } | null;
}

function FlavorContent({ flavor, isOwner, isSharedWithMe, sharedBy }: FlavorContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sharing");
  const [currentStatus, setCurrentStatus] = useState<StatusValue>(
    (flavor.status as StatusValue) || "draft"
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Fetch category name if category_id exists
  useEffect(() => {
    async function fetchCategory() {
      if (flavor.category_id) {
        try {
          const category = await getCategoryById(flavor.category_id);
          if (category) {
            setCategoryName(category.name);
          }
        } catch (error) {
          console.error("Error fetching category:", error);
        }
      }
    }
    fetchCategory();
  }, [flavor.category_id]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      fema_number: true,
      common_name: true,
      is_natural: true,
      odor: true,
      olfactory_taste_notes: true,
      functional_groups: true,
      flavor_profile: true,
      cas_number: true,
    }
  );

  // All possible columns for the dropdown
  const allColumns = [
    { key: "fema_number", label: "FEMA #" },
    { key: "common_name", label: "Common Name" },
    { key: "is_natural", label: "Natural/Synthetic" },
    { key: "odor", label: "Odor" },
    { key: "olfactory_taste_notes", label: "Odor Notes" },
    { key: "functional_groups", label: "Functional Groups" },
    { key: "flavor_profile", label: "Flavor Profile" },
    { key: "cas_number", label: "CAS Number" },
  ];

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Show all columns
  const showAllColumns = () => {
    const allVisible = Object.fromEntries(
      allColumns.map(({ key }) => [key, true])
    );
    setVisibleColumns(allVisible);
  };

  // Hide all optional columns (keep essential ones visible)
  const hideOptionalColumns = () => {
    setVisibleColumns({
      fema_number: true,
      common_name: true,
      is_natural: true,
      odor: false,
      olfactory_taste_notes: true,
      functional_groups: false,
      flavor_profile: true,
      cas_number: false,
    });
  };

  const [femaNumberToAdd, setfemaNumberToAdd] = useState("");
  const [concentration, setConcentration] = useState("");
  const [unit, setUnit] = useState("");

  const handleAddSubstance = async () => {
    try {
      await addSubstanceToFlavour(flavor.flavour_id, {
        fema_number: parseInt(femaNumberToAdd),
        concentration: parseFloat(concentration),
        unit,
        order_index: flavor.substances?.length || 0,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error adding substance:", error);
    }
  };

  const handleRemoveSubstance = async (substanceId: number) => {
    try {
      await removeSubstanceFromFlavour(flavor.flavour_id, substanceId);
      window.location.reload();
    } catch (error) {
      console.error("Error removing substance:", error);
    }
  };

  const handleStatusChange = async (newStatus: StatusValue) => {
    if (newStatus === currentStatus) return;

    setIsUpdatingStatus(true);
    try {
      await updateFlavourStatus(flavor.flavour_id, newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusClassName = (status: StatusValue) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.className || "bg-gray-100 text-gray-800";
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const newFlavour = await duplicateFlavour(flavor.flavour_id);
      toast.success("Flavour duplicated");
      router.push(`/${locale}/flavours/${newFlavour.flavour_id}`);
    } catch (error) {
      console.error("Error duplicating flavour:", error);
      toast.error("Failed to duplicate flavour");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFlavour(flavor.flavour_id);
      toast.success("Flavour deleted");
      router.push(`/${locale}/flavours`);
    } catch (error) {
      console.error("Error deleting flavour:", error);
      toast.error("Failed to delete flavour");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Shared with you banner */}
      {isSharedWithMe && sharedBy && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("sharedWithYouBy", { name: sharedBy.username || sharedBy.email })}
          </span>
          <Badge variant="secondary" className="ml-auto">{t("viewOnly")}</Badge>
        </div>
      )}

      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/flavours`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">{flavor.name}</h1>
        <div className="flex items-center gap-2">
          {/* Owner-only actions */}
          {isOwner && (
            <>
              <ShareFlavourDialog
                flavourId={flavor.flavour_id}
                flavourName={flavor.name}
              />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/flavours/${flavor.flavour_id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Flavour</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{flavor.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {/* Duplicate button for shared flavours */}
          {isSharedWithMe && !isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              <Copy className="h-4 w-4 mr-2" />
              {isDuplicating ? t("duplicating") : t("duplicateToMyFlavours")}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">{flavor.description}</p>
        <div className="flex gap-2 text-sm text-muted-foreground items-center">
          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value as StatusValue)}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className={`w-[130px] h-8 ${getStatusClassName(currentStatus)}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className={`px-1 py-0.5 rounded ${option.className}`}>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {flavor.is_public ? "Public" : "Private"}
          </Badge>
          {flavor.version !== null && (
            <Badge variant="outline">v{flavor.version}</Badge>
          )}
          {flavor.base_unit && (
            <Badge variant="outline">{flavor.base_unit}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(flavor.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(flavor.updated_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {flavor.user_id}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Category:</span>{" "}
                {categoryName || (flavor.category_id ? "Loading..." : "None")}
              </div>
              <div>
                <span className="font-medium">Base Unit:</span>{" "}
                {flavor.base_unit || "None"}
              </div>
              <div>
                <span className="font-medium">Version:</span>{" "}
                {flavor.version !== null ? `v${flavor.version}` : "None"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <FlavorProfileChart
            flavourId={flavor.flavour_id}
            initialProfile={flavor.flavor_profile}
            readOnly={!isOwner}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Substances ({flavor.substances?.length || 0})</CardTitle>
          <div className="flex items-center gap-2">
            {/* Add substance form - only for owners */}
            {isOwner && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FEMA Number"
                  className="px-2 py-1 border rounded"
                  value={femaNumberToAdd}
                  onChange={(e) => setfemaNumberToAdd(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Concentration"
                  className="px-2 py-1 border rounded"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="px-2 py-1 border rounded"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubstance}
                  disabled={!femaNumberToAdd || !concentration || !unit}
                >
                  Add Substance
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Show All</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideOptionalColumns}
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Optional</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns[column.key]}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {!flavor.substances || flavor.substances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No substances added to this flavor yet.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {allColumns.map(
                      (column) =>
                        visibleColumns[column.key] && (
                          <TableHead key={column.key}>{column.label}</TableHead>
                        )
                    )}
                    {isOwner && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flavor.substances?.map((substance) => (
                    <TableRow key={substance.substance_id}>
                      {visibleColumns.fema_number && (
                        <TableCell className="font-medium">
                          {substance.substance?.fema_number !== null &&
                          substance.substance?.fema_number !== undefined
                            ? substance.substance.fema_number
                            : "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.common_name && (
                        <TableCell>
                          {substance.substance?.common_name || "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.is_natural && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              substance.substance?.is_natural === true
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : substance.substance?.is_natural === false
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {substance.substance?.is_natural === true
                              ? "Natural"
                              : substance.substance?.is_natural === false
                              ? "Synthetic"
                              : "Unknown"}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.odor && (
                        <TableCell>
                          {substance.substance?.odor || "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.olfactory_taste_notes && (
                        <TableCell>
                          {substance.substance?.olfactory_taste_notes || "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.functional_groups && (
                        <TableCell>
                          {substance.substance?.functional_groups || "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.flavor_profile && (
                        <TableCell>
                          {substance.substance?.flavor_profile || "N/A"}
                        </TableCell>
                      )}
                      {visibleColumns.cas_number && (
                        <TableCell>
                          {substance.substance?.cas_id || "N/A"}
                        </TableCell>
                      )}
                      {isOwner && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveSubstance(substance.substance_id)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export default function FlavorDetailPage() {
  const params = useParams();
  const flavorId = parseInt(params.id as string, 10);
  const [flavor, setFlavor] = useState<Flavour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [isSharedWithMe, setIsSharedWithMe] = useState(false);
  const [sharedBy, setSharedBy] = useState<{ username: string | null; email: string } | null>(null);

  useEffect(() => {
    async function fetchFlavorData() {
      if (isNaN(flavorId)) {
        setError("Invalid flavor ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFlavourById(flavorId);

        // Transform the data to match your frontend expectations
        const transformedData = {
          flavour_id: Number(data.flavour.flavour_id),
          name: data.flavour.name || "Unnamed Flavor",
          description: data.flavour.description || "",
          // Transform substances to match the expected nested structure
          substances: Array.isArray(data.substances)
            ? data.substances.map(
                (substance, index: number) => ({
                  substance_id: (substance as { substance_id: number }).substance_id,
                  concentration: 0, // Default values since not provided by API
                  unit: "ppm" as const,
                  order_index: index,
                  substance: substance as Substance, // Nest the actual substance data
                })
              )
            : [],
          status: data.flavour.status || "draft",
          is_public: Boolean(data.flavour.is_public),
          version:
            data.flavour.version !== null ? Number(data.flavour.version) : null,
          base_unit: data.flavour.base_unit || "",
          category_id:
            data.flavour.category_id !== null
              ? Number(data.flavour.category_id)
              : null,
          flavor_profile: data.flavour.flavor_profile || null,
          created_at: data.flavour.created_at || new Date().toISOString(),
          updated_at: data.flavour.updated_at || new Date().toISOString(),
          user_id: data.flavour.user_id || "Unknown",
        } as Flavour;

        setFlavor(transformedData);
        setIsOwner(data.isOwner ?? true);
        setIsSharedWithMe(data.isSharedWithMe ?? false);
        setSharedBy(data.sharedBy ?? null);
        setError(null);
      } catch (err) {
        console.error("Error fetching flavor:", err);
        setError("Failed to load flavor data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlavorData();
  }, [flavorId]);

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!flavor) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Flavor not found</h2>
            <p className="text-muted-foreground">
              The flavor you are looking for does not exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <FlavorContent
        flavor={flavor}
        isOwner={isOwner}
        isSharedWithMe={isSharedWithMe}
        sharedBy={sharedBy}
      />
    </Suspense>
  );
}

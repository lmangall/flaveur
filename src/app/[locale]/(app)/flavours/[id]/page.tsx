"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, ChevronDown, Trash2, Pencil, Copy, ArrowLeft, Plus, X, Save, Share2, Shield, HelpCircle, MoreVertical, Check, RefreshCw, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { Flavour, Substance, FlavorProfileAttribute, SubstanceInFlavour } from "@/app/type";
import { ConcentrationUnitValue } from "@/constants/flavour";
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
import { VariationPills } from "@/app/[locale]/components/VariationPills";
import { useTranslations } from "next-intl";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { useSetBreadcrumbLabel } from "@/app/[locale]/components/layout/Breadcrumbs";

// Status options - labels will be translated in component
const STATUS_OPTIONS = [
  { value: "draft", labelKey: "draft", className: "bg-amber-100 text-amber-800" },
  { value: "published", labelKey: "published", className: "bg-green-100 text-green-800" },
  { value: "archived", labelKey: "archived", className: "bg-gray-100 text-gray-800" },
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
  translations: {
    addAttribute: string;
    newAttributeName: string;
    add: string;
    cancel: string;
    saving: string;
    saveProfile: string;
    minimumAttributes: string;
    flavorProfileSaved: string;
    failedToSaveProfile: string;
  };
}

function FlavorProfileChart({ flavourId, initialProfile, readOnly = false, translations }: FlavorProfileChartProps) {
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
      toast.error(translations.minimumAttributes);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFlavorProfile(flavourId, profile);
      toast.success(translations.flavorProfileSaved);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving flavor profile:", error);
      toast.error(translations.failedToSaveProfile);
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
                    placeholder={translations.newAttributeName}
                    className="flex-1 h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAttribute()}
                  />
                  <Button size="sm" onClick={handleAddAttribute}>
                    {translations.add}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingAttribute(false);
                      setNewAttribute("");
                    }}
                  >
                    {translations.cancel}
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
                  {translations.addAttribute}
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
            {isSaving ? translations.saving : translations.saveProfile}
          </Button>
        </div>
      )}
    </div>
  );
}

interface FlavorContentProps {
  flavor: Flavour;
  setFlavor: React.Dispatch<React.SetStateAction<Flavour | null>>;
  isOwner: boolean;
  isSharedWithMe: boolean;
  sharedBy?: { username: string | null; email: string } | null;
}

function FlavorContent({ flavor, setFlavor, isOwner, isSharedWithMe, sharedBy }: FlavorContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sharing");
  const tFlavour = useTranslations("FlavourDetail");
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
      concentration: true,
      is_natural: true,
      odor: true,
      olfactory_taste_notes: true,
      functional_groups: true,
      flavor_profile: true,
      cas_number: true,
      supplier: false,
      dilution: false,
      price_per_kg: false,
    }
  );

  // All possible columns for the dropdown
  const allColumns = [
    { key: "fema_number", label: tFlavour("femaNumber") },
    { key: "common_name", label: tFlavour("commonName") },
    { key: "concentration", label: tFlavour("concentration") },
    { key: "is_natural", label: tFlavour("naturalSynthetic") },
    { key: "odor", label: tFlavour("odor") },
    { key: "olfactory_taste_notes", label: tFlavour("odorNotes") },
    { key: "functional_groups", label: tFlavour("functionalGroups") },
    { key: "flavor_profile", label: tFlavour("flavorProfileColumn") },
    { key: "cas_number", label: tFlavour("casNumber") },
    { key: "supplier", label: tFlavour("supplier") },
    { key: "dilution", label: tFlavour("dilution") },
    { key: "price_per_kg", label: tFlavour("pricePerKg") },
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
  const [supplier, setSupplier] = useState("");
  const [dilution, setDilution] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");

  // Edit substance state
  const [editingSubstanceId, setEditingSubstanceId] = useState<number | null>(null);
  const [editConcentration, setEditConcentration] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editDilution, setEditDilution] = useState("");
  const [editPricePerKg, setEditPricePerKg] = useState("");

  // Substance variations state
  const [variationsSubstanceId, setVariationsSubstanceId] = useState<number | null>(null);
  const [variationsLoading, setVariationsLoading] = useState(false);
  const [substanceVariations, setSubstanceVariations] = useState<Array<{
    substance_id: number;
    fema_number: number | null;
    common_name: string;
    cas_id: string | null;
    flavor_profile: string | null;
    odor: string | null;
  }>>([]);

  // Substance search state for adding new substances
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchField, setActiveSearchField] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{
    substance_id: number;
    fema_number: number | null;
    common_name: string;
    flavor_profile: string | null;
    odor: string | null;
    olfactory_taste_notes: string | null;
    cas_id: string | null;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSubstance, setSelectedSubstance] = useState<{
    substance_id: number;
    fema_number: number | null;
    common_name: string;
    flavor_profile: string | null;
    odor: string | null;
    olfactory_taste_notes: string | null;
    cas_id: string | null;
  } | null>(null);

  // Search for substances when query changes
  useEffect(() => {
    const searchForSubstances = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const { searchSubstances } = await import("@/actions/substances");
        // Use "profile" category for flavor/odor searches, "all" for others
        const category = activeSearchField === "flavor_profile" || activeSearchField === "odor" || activeSearchField === "olfactory_taste_notes"
          ? "profile"
          : "all";
        const response = await searchSubstances(searchQuery, category, 1, 10);
        setSearchResults(response.results as typeof searchResults);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error searching substances:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchForSubstances, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeSearchField]);

  const handleSelectSubstance = (substance: typeof searchResults[0]) => {
    setSelectedSubstance({
      substance_id: substance.substance_id,
      fema_number: substance.fema_number,
      common_name: substance.common_name,
      flavor_profile: substance.flavor_profile,
      odor: substance.odor,
      olfactory_taste_notes: substance.olfactory_taste_notes,
      cas_id: substance.cas_id,
    });
    setfemaNumberToAdd(substance.fema_number?.toString() || "");
    setSearchQuery("");
    setShowSearchResults(false);
    setActiveSearchField(null);
  };

  const handleSearchFocus = (field: string) => {
    setActiveSearchField(field);
    if (searchQuery.length >= 2) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Keep results visible - they're table rows now, user can click anytime
    setActiveSearchField(null);
  };


  const handleAddSubstance = async () => {
    if (!selectedSubstance) return;

    try {
      const result = await addSubstanceToFlavour(flavor.flavour_id, {
        fema_number: parseInt(femaNumberToAdd),
        concentration: concentration ? parseFloat(concentration) : null,
        unit: unit || null,
        order_index: flavor.substances?.length || 0,
        supplier: supplier || null,
        dilution: dilution || null,
        price_per_kg: pricePerKg ? parseFloat(pricePerKg) : null,
      });

      // Update local state with new substance
      const newSubstanceEntry: SubstanceInFlavour = {
        substance_id: selectedSubstance.substance_id,
        concentration: concentration ? parseFloat(concentration) : 0,
        unit: (unit || "g/kg") as ConcentrationUnitValue,
        order_index: flavor.substances?.length || 0,
        supplier: supplier || null,
        dilution: dilution || null,
        price_per_kg: pricePerKg ? parseFloat(pricePerKg) : null,
        substance: {
          substance_id: selectedSubstance.substance_id,
          fema_number: selectedSubstance.fema_number,
          common_name: selectedSubstance.common_name,
          flavor_profile: selectedSubstance.flavor_profile,
          odor: selectedSubstance.odor,
          olfactory_taste_notes: selectedSubstance.olfactory_taste_notes,
          cas_id: selectedSubstance.cas_id,
        } as Substance,
      };

      setFlavor((prev): Flavour | null => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: [...(prev.substances || []), newSubstanceEntry],
        };
      });

      // Clear form
      setSelectedSubstance(null);
      setfemaNumberToAdd("");
      setConcentration("");
      setUnit("");
      setSupplier("");
      setDilution("");
      setPricePerKg("");
    } catch (error) {
      console.error("Error adding substance:", error);
    }
  };

  const handleRemoveSubstance = async (substanceId: number) => {
    try {
      await removeSubstanceFromFlavour(flavor.flavour_id, substanceId);

      // Update local state
      setFlavor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: prev.substances?.filter((s) => s.substance_id !== substanceId) || [],
        };
      });
    } catch (error) {
      console.error("Error removing substance:", error);
    }
  };

  const startEditingSubstance = (substance: SubstanceInFlavour) => {
    setEditingSubstanceId(substance.substance_id);
    setEditConcentration(substance.concentration?.toString() || "");
    setEditUnit(substance.unit || "");
    setEditSupplier(substance.supplier || "");
    setEditDilution(substance.dilution || "");
    setEditPricePerKg(substance.price_per_kg?.toString() || "");
  };

  const cancelEditingSubstance = () => {
    setEditingSubstanceId(null);
    setEditConcentration("");
    setEditUnit("");
    setEditSupplier("");
    setEditDilution("");
    setEditPricePerKg("");
  };

  const handleSaveSubstance = async (substanceId: number) => {
    try {
      const { updateSubstanceInFlavour } = await import("@/actions/flavours");
      await updateSubstanceInFlavour(flavor.flavour_id, substanceId, {
        concentration: editConcentration ? parseFloat(editConcentration) : null,
        unit: editUnit || null,
        supplier: editSupplier || null,
        dilution: editDilution || null,
        price_per_kg: editPricePerKg ? parseFloat(editPricePerKg) : null,
      });

      // Update local state
      setFlavor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: prev.substances?.map((s) =>
            s.substance_id === substanceId
              ? {
                  ...s,
                  concentration: editConcentration ? parseFloat(editConcentration) : 0,
                  unit: (editUnit || "g/kg") as ConcentrationUnitValue,
                  supplier: editSupplier || null,
                  dilution: editDilution || null,
                  price_per_kg: editPricePerKg ? parseFloat(editPricePerKg) : null,
                }
              : s
          ) || [],
        };
      });

      cancelEditingSubstance();
    } catch (error) {
      console.error("Error updating substance:", error);
    }
  };

  const handleLoadVariations = async (substanceId: number) => {
    if (variationsSubstanceId === substanceId) {
      // Toggle off if already showing
      setVariationsSubstanceId(null);
      setSubstanceVariations([]);
      return;
    }

    setVariationsSubstanceId(substanceId);
    setVariationsLoading(true);
    try {
      const { getRelatedSubstanceVariations } = await import("@/actions/substances");
      const variations = await getRelatedSubstanceVariations(substanceId);
      setSubstanceVariations(variations);
    } catch (error) {
      console.error("Error loading variations:", error);
      setSubstanceVariations([]);
    } finally {
      setVariationsLoading(false);
    }
  };

  const handleSwapSubstance = async (oldSubstanceId: number, newSubstance: {
    substance_id: number;
    fema_number: number | null;
    common_name: string;
    cas_id: string | null;
    flavor_profile: string | null;
    odor: string | null;
  }) => {
    // Get the old substance data to preserve concentration, unit, etc.
    const oldSubstanceData = flavor.substances?.find((s) => s.substance_id === oldSubstanceId);
    if (!oldSubstanceData) return;

    try {
      // Remove old substance
      await removeSubstanceFromFlavour(flavor.flavour_id, oldSubstanceId);

      // Add new substance with same concentration
      await addSubstanceToFlavour(flavor.flavour_id, {
        fema_number: newSubstance.fema_number || 0,
        concentration: oldSubstanceData.concentration || null,
        unit: oldSubstanceData.unit || null,
        order_index: oldSubstanceData.order_index,
        supplier: oldSubstanceData.supplier,
        dilution: oldSubstanceData.dilution,
        price_per_kg: oldSubstanceData.price_per_kg,
      });

      // Update local state
      setFlavor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: prev.substances?.map((s) =>
            s.substance_id === oldSubstanceId
              ? {
                  ...s,
                  substance_id: newSubstance.substance_id,
                  substance: {
                    ...s.substance,
                    substance_id: newSubstance.substance_id,
                    fema_number: newSubstance.fema_number,
                    common_name: newSubstance.common_name,
                    cas_id: newSubstance.cas_id,
                    flavor_profile: newSubstance.flavor_profile,
                    odor: newSubstance.odor,
                  } as Substance,
                }
              : s
          ) || [],
        };
      });

      // Close variations panel
      setVariationsSubstanceId(null);
      setSubstanceVariations([]);
      toast.success(tFlavour("swappedTo", { name: newSubstance.common_name }));
    } catch (error) {
      console.error("Error swapping substance:", error);
      toast.error(tFlavour("failedToSwap"));
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
      toast.success(tFlavour("flavourDuplicated"));
      router.push(`/${locale}/flavours/${newFlavour.flavour_id}`);
    } catch (error) {
      console.error("Error duplicating flavour:", error);
      toast.error(tFlavour("failedToDuplicate"));
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFlavour(flavor.flavour_id);
      toast.success(tFlavour("flavourDeleted"));
      router.push(`/${locale}/flavours`);
    } catch (error) {
      console.error("Error deleting flavour:", error);
      toast.error(tFlavour("failedToDelete"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
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
          {/* EU Compliance Check - available to all with access */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/flavours/${flavor.flavour_id}/compliance`}>
              <Shield className="h-4 w-4 mr-2" />
              {tFlavour("checkEuCompliance")}
            </Link>
          </Button>
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
                  {tFlavour("edit")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? tFlavour("duplicating") : tFlavour("duplicate")}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tFlavour("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tFlavour("deleteFlavour")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {tFlavour("deleteConfirmation", { name: flavor.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tFlavour("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? tFlavour("deleting") : tFlavour("delete")}
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

      {/* Variation pills - separate row for clarity */}
      {isOwner && (
        <VariationPills flavourId={flavor.flavour_id} />
      )}

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
                    {tFlavour(option.labelKey)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {flavor.is_public ? tFlavour("public") : tFlavour("private")}
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
          <CardTitle>{tFlavour("flavorDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">{tFlavour("created")}:</span>{" "}
                {new Date(flavor.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">{tFlavour("lastUpdated")}:</span>{" "}
                {new Date(flavor.updated_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">{tFlavour("userId")}:</span> {flavor.user_id}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">{tFlavour("category")}:</span>{" "}
                {categoryName || (flavor.category_id ? tFlavour("loading") : tFlavour("none"))}
              </div>
              <div>
                <span className="font-medium">{tFlavour("baseUnit")}:</span>{" "}
                {flavor.base_unit || tFlavour("none")}
              </div>
              <div>
                <span className="font-medium">{tFlavour("version")}:</span>{" "}
                {flavor.version !== null ? `v${flavor.version}` : tFlavour("none")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tFlavour("flavorProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FlavorProfileChart
            flavourId={flavor.flavour_id}
            initialProfile={flavor.flavor_profile}
            readOnly={!isOwner}
            translations={{
              addAttribute: tFlavour("addAttribute"),
              newAttributeName: tFlavour("newAttributeName"),
              add: tFlavour("add"),
              cancel: tFlavour("cancel"),
              saving: tFlavour("saving"),
              saveProfile: tFlavour("saveProfile"),
              minimumAttributes: tFlavour("minimumAttributes"),
              flavorProfileSaved: tFlavour("flavorProfileSaved"),
              failedToSaveProfile: tFlavour("failedToSaveProfile"),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tFlavour("substances")} ({flavor.substances?.length || 0})</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{tFlavour("showAll")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideOptionalColumns}
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">{tFlavour("hideOptional")}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  {tFlavour("columns")} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{tFlavour("toggleColumns")}</DropdownMenuLabel>
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
          {(!flavor.substances || flavor.substances.length === 0) && !isOwner ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{tFlavour("noSubstancesYet")}</p>
            </div>
          ) : (
            <TooltipProvider>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {allColumns.map(
                      (column) =>
                        visibleColumns[column.key] && (
                          <TableHead key={column.key}>
                            {column.key === "concentration" ? (
                              <div className="flex items-center gap-1">
                                {column.label}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs text-left">
                                    <p className="font-medium">{tFlavour("concentrationTooltipTitle")}</p>
                                    <p className="text-xs mt-1">{tFlavour("concentrationTooltipDesc")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : column.key === "dilution" ? (
                              <div className="flex items-center gap-1">
                                {column.label}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs text-left">
                                    <p className="font-medium">{tFlavour("dilutionTooltipTitle")}</p>
                                    <p className="text-xs mt-1">{tFlavour("dilutionTooltipDesc")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : (
                              column.label
                            )}
                          </TableHead>
                        )
                    )}
                    {isOwner && <TableHead className="text-right">{tFlavour("actions")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flavor.substances?.flatMap((substance) => [
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
                      {visibleColumns.concentration && (
                        <TableCell>
                          {editingSubstanceId === substance.substance_id ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                className="w-16 px-2 py-1 border rounded text-sm bg-background"
                                value={editConcentration}
                                onChange={(e) => setEditConcentration(e.target.value)}
                              />
                              <select
                                className="w-20 px-1 py-1 border rounded text-sm bg-background"
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                              >
                                <option value="">—</option>
                                <option value="%(v/v)">%</option>
                                <option value="g/kg">g/kg</option>
                                <option value="g/L">g/L</option>
                                <option value="mL/L">mL/L</option>
                                <option value="ppm">ppm</option>
                              </select>
                            </div>
                          ) : (
                            <>
                              {substance.concentration} {substance.unit}
                            </>
                          )}
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
                              ? tFlavour("natural")
                              : substance.substance?.is_natural === false
                              ? tFlavour("synthetic")
                              : tFlavour("unknown")}
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
                      {visibleColumns.supplier && (
                        <TableCell>
                          {editingSubstanceId === substance.substance_id ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={editSupplier}
                              onChange={(e) => setEditSupplier(e.target.value)}
                              placeholder={tFlavour("supplier")}
                            />
                          ) : (
                            substance.supplier || "-"
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.dilution && (
                        <TableCell>
                          {editingSubstanceId === substance.substance_id ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={editDilution}
                              onChange={(e) => setEditDilution(e.target.value)}
                              placeholder={tFlavour("dilutionPlaceholder")}
                            />
                          ) : (
                            substance.dilution || "-"
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.price_per_kg && (
                        <TableCell>
                          {editingSubstanceId === substance.substance_id ? (
                            <input
                              type="text"
                              className="w-20 px-2 py-1 border rounded text-sm bg-background"
                              value={editPricePerKg}
                              onChange={(e) => setEditPricePerKg(e.target.value)}
                              placeholder={tFlavour("pricePlaceholder")}
                            />
                          ) : (
                            substance.price_per_kg != null ? `€${substance.price_per_kg.toFixed(2)}` : "-"
                          )}
                        </TableCell>
                      )}
                      {isOwner && (
                        <TableCell className="text-right">
                          {editingSubstanceId === substance.substance_id ? (
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSaveSubstance(substance.substance_id)}
                                title={tFlavour("save")}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEditingSubstance}
                                title={tFlavour("cancel")}
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{tFlavour("actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <button
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                                  onClick={() => startEditingSubstance(substance)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  {tFlavour("edit")}
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                                  onClick={() => handleLoadVariations(substance.substance_id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  {tFlavour("variations")}
                                  {variationsSubstanceId === substance.substance_id && (
                                    <span className="ml-auto text-xs text-muted-foreground">✓</span>
                                  )}
                                </button>
                                <DropdownMenuSeparator />
                                <button
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer text-destructive"
                                  onClick={() => handleRemoveSubstance(substance.substance_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {tFlavour("delete")}
                                </button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>,
                    // Variations row - shown when user clicks "Variations" in dropdown
                    variationsSubstanceId === substance.substance_id && (
                      <TableRow key={`variations-${substance.substance_id}`} className="bg-amber-50/50">
                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + (isOwner ? 1 : 0)} className="py-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                              <RefreshCw className="h-4 w-4" />
                              {tFlavour("suggestedVariations", { name: substance.substance?.common_name || "" })}
                              <button
                                className="ml-auto text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setVariationsSubstanceId(null);
                                  setSubstanceVariations([]);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {variationsLoading ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {tFlavour("loadingVariations")}
                              </div>
                            ) : substanceVariations.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                {tFlavour("noVariationsFound")}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {substanceVariations.map((variation) => (
                                  <button
                                    key={variation.substance_id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-white border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                                    onClick={() => handleSwapSubstance(substance.substance_id, variation)}
                                  >
                                    <span className="font-medium">{variation.common_name}</span>
                                    {variation.fema_number && (
                                      <span className="text-xs text-muted-foreground">#{variation.fema_number}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  ].filter(Boolean))}
                  {/* Add substance row - only for owners */}
                  {isOwner && (
                    <TableRow className="bg-muted/30">
                      {visibleColumns.fema_number && (
                        <TableCell>
                          {selectedSubstance ? (
                            <span className="text-sm font-medium">{selectedSubstance.fema_number || tFlavour("na")}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder={tFlavour("femaNumber")}
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={femaNumberToAdd}
                              onChange={(e) => setfemaNumberToAdd(e.target.value)}
                            />
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.common_name && (
                        <TableCell className="relative">
                          {selectedSubstance ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{selectedSubstance.common_name}</span>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setSelectedSubstance(null);
                                  setfemaNumberToAdd("");
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFlavour("searchName")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "common_name" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("common_name")}
                                onBlur={handleSearchBlur}
                              />
                                                          </>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.concentration && (
                        <TableCell>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="0.5"
                              className="w-16 px-2 py-1 border rounded text-sm bg-background"
                              value={concentration}
                              onChange={(e) => setConcentration(e.target.value)}
                            />
                            <select
                              className="w-20 px-1 py-1 border rounded text-sm bg-background"
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                            >
                              <option value="">—</option>
                              <option value="%(v/v)">%</option>
                              <option value="g/kg">g/kg</option>
                              <option value="g/L">g/L</option>
                              <option value="mL/L">mL/L</option>
                              <option value="ppm">ppm</option>
                            </select>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.is_natural && (
                        <TableCell className="text-muted-foreground text-sm">
                          {selectedSubstance ? "—" : "—"}
                        </TableCell>
                      )}
                      {visibleColumns.odor && (
                        <TableCell className="relative">
                          {selectedSubstance ? (
                            <span className="text-sm">{selectedSubstance.odor || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFlavour("searchOdor")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "odor" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("odor")}
                                onBlur={handleSearchBlur}
                              />
                                                          </>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.olfactory_taste_notes && (
                        <TableCell className="relative">
                          {selectedSubstance ? (
                            <span className="text-sm">{selectedSubstance.olfactory_taste_notes || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFlavour("searchNotes")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "olfactory_taste_notes" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("olfactory_taste_notes")}
                                onBlur={handleSearchBlur}
                              />
                                                          </>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.functional_groups && (
                        <TableCell className="text-muted-foreground text-sm">
                          —
                        </TableCell>
                      )}
                      {visibleColumns.flavor_profile && (
                        <TableCell className="relative">
                          {selectedSubstance ? (
                            <span className="text-sm">{selectedSubstance.flavor_profile || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFlavour("searchFlavor")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "flavor_profile" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("flavor_profile")}
                                onBlur={handleSearchBlur}
                              />
                                                          </>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.cas_number && (
                        <TableCell className="relative">
                          {selectedSubstance ? (
                            <span className="text-sm">{selectedSubstance.cas_id || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFlavour("searchCas")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "cas_number" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("cas_number")}
                                onBlur={handleSearchBlur}
                              />
                                                          </>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.supplier && (
                        <TableCell>
                          <input
                            type="text"
                            placeholder={tFlavour("supplier")}
                            className="w-full px-2 py-1 border rounded text-sm bg-background"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.dilution && (
                        <TableCell>
                          <input
                            type="text"
                            placeholder={tFlavour("dilutionPlaceholder")}
                            className="w-full px-2 py-1 border rounded text-sm bg-background"
                            value={dilution}
                            onChange={(e) => setDilution(e.target.value)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.price_per_kg && (
                        <TableCell>
                          <input
                            type="text"
                            placeholder={tFlavour("pricePlaceholder")}
                            className="w-20 px-2 py-1 border rounded text-sm bg-background"
                            value={pricePerKg}
                            onChange={(e) => setPricePerKg(e.target.value)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddSubstance}
                          disabled={!femaNumberToAdd}
                          className={`${
                            !femaNumberToAdd
                              ? "text-muted-foreground"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={!femaNumberToAdd ? tFlavour("selectSubstanceFirst") : tFlavour("addSubstance")}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {tFlavour("add")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Search results as table rows */}
                  {isOwner && showSearchResults && searchResults.length > 0 && (
                    searchResults.map((substance, index) => (
                      <TableRow
                        key={`search-${substance.substance_id}`}
                        className={`cursor-pointer hover:bg-primary/10 ${
                          index % 2 === 0 ? "bg-blue-50/50" : "bg-blue-100/50"
                        }`}
                        onClick={() => handleSelectSubstance(substance)}
                      >
                        {visibleColumns.fema_number && (
                          <TableCell className="font-medium">
                            {substance.fema_number || "—"}
                          </TableCell>
                        )}
                        {visibleColumns.common_name && (
                          <TableCell>{substance.common_name}</TableCell>
                        )}
                        {visibleColumns.concentration && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.is_natural && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.odor && (
                          <TableCell className="text-sm">{substance.odor || "—"}</TableCell>
                        )}
                        {visibleColumns.olfactory_taste_notes && (
                          <TableCell className="text-sm">{substance.olfactory_taste_notes || "—"}</TableCell>
                        )}
                        {visibleColumns.functional_groups && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.flavor_profile && (
                          <TableCell className="text-sm">{substance.flavor_profile || "—"}</TableCell>
                        )}
                        {visibleColumns.cas_number && (
                          <TableCell className="text-sm">{substance.cas_id || "—"}</TableCell>
                        )}
                        {visibleColumns.supplier && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.dilution && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.price_per_kg && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {tFlavour("clickToSelect")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {isOwner && showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-sm text-muted-foreground py-4">
                        {tFlavour("noSubstancesFound", { query: searchQuery })}
                      </TableCell>
                    </TableRow>
                  )}
                  {isOwner && isSearching && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-sm text-muted-foreground py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          {tFlavour("searching")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            </TooltipProvider>
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
  const searchParams = useSearchParams();
  const { fire: fireConfetti } = useConfetti();
  const tFlavour = useTranslations("FlavourDetail");
  const flavorId = parseInt(params.id as string, 10);
  const [flavor, setFlavor] = useState<Flavour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [isSharedWithMe, setIsSharedWithMe] = useState(false);
  const [sharedBy, setSharedBy] = useState<{ username: string | null; email: string } | null>(null);

  // Set breadcrumb label to flavour name
  useSetBreadcrumbLabel(params.id as string, flavor?.name);

  // Fire confetti when arriving from invite acceptance
  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      fireConfetti();
      // Clean up URL without page reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, fireConfetti]);

  useEffect(() => {
    async function fetchFlavorData() {
      if (isNaN(flavorId)) {
        setError(tFlavour("invalidFlavorId"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFlavourById(flavorId);

        // Transform the data to match your frontend expectations
        const transformedData = {
          flavour_id: Number(data.flavour.flavour_id),
          name: data.flavour.name || tFlavour("unnamedFlavor"),
          description: data.flavour.description || "",
          // Transform substances to match the expected nested structure
          substances: Array.isArray(data.substances)
            ? data.substances.map(
                (substance: Record<string, unknown>, index: number) => ({
                  substance_id: Number(substance.substance_id),
                  concentration: Number(substance.concentration) || 0,
                  unit: (substance.unit as string) || "ppm",
                  order_index: Number(substance.order_index) ?? index,
                  supplier: substance.supplier as string | null,
                  dilution: substance.dilution as string | null,
                  price_per_kg: substance.price_per_kg != null ? Number(substance.price_per_kg) : null,
                  substance: substance as unknown as Substance, // Nest the actual substance data
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
        setError(tFlavour("failedToLoadFlavor"));
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
            <h2 className="text-xl font-semibold mb-2">{tFlavour("error")}</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              {tFlavour("goBack")}
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
            <h2 className="text-xl font-semibold mb-2">{tFlavour("flavorNotFound")}</h2>
            <p className="text-muted-foreground">
              {tFlavour("flavorNotFoundDesc")}
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              {tFlavour("goBack")}
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
        setFlavor={setFlavor}
        isOwner={isOwner}
        isSharedWithMe={isSharedWithMe}
        sharedBy={sharedBy}
      />
    </Suspense>
  );
}

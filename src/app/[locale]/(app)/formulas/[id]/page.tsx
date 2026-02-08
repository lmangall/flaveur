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
import { PillSelect } from "@/app/[locale]/components/ui/pill-select";
import { Eye, EyeOff, ChevronDown, ChevronUp, ChevronRight, Trash2, Pencil, Copy, ArrowLeft, Plus, X, Share2, Shield, HelpCircle, MoreVertical, Check, RefreshCw, Loader2, Package, Settings2, Calendar, Tag, Hash, SlidersHorizontal } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/[locale]/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { Formula, Substance, FlavorProfileAttribute, SubstanceInFormula } from "@/app/type";
import { cn } from "@/lib/utils";
import { ConcentrationUnitValue } from "@/constants/formula";
import { PYRAMID_POSITION_OPTIONS } from "@/constants/perfumery";
import {
  COSMETIC_PHASE_OPTIONS,
  COSMETIC_PHASE_COLORS,
  COSMETIC_ROLE_COLORS,
  PRODUCT_TYPE_PHASES,
  type CosmeticPhaseValue,
  type CosmeticProductTypeValue,
} from "@/constants/cosmetics";
import {
  getFormulaById,
  addSubstanceToFormula,
  removeSubstanceFromFormula,
  updateFormulaStatus,
  deleteFormula,
  duplicateFormula,
  updateFlavorProfile,
  updateSubstancePhase,
} from "@/actions/formulas";
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
import { ShareFormulaDialog } from "@/app/[locale]/components/share-formula-dialog";
import { VariationPills } from "@/app/[locale]/components/VariationPills";
import { FormulaNotesCard } from "@/app/[locale]/components/FormulaNotesCard";
import { useTranslations } from "next-intl";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { useSetBreadcrumbLabel } from "@/app/[locale]/components/layout/Breadcrumbs";
import { OlfactivePyramid } from "@/app/[locale]/components/OlfactivePyramid";
import { CosmeticDetailsCard } from "@/app/[locale]/components/CosmeticDetailsCard";
import { HlbCalculator } from "@/app/[locale]/components/HlbCalculator";
import { PhaseGroupedView } from "@/app/[locale]/components/PhaseGroupedView";
import { SubstanceDetailsModal, SubstanceForModal } from "@/app/[locale]/components/substance-details-modal";
import { CompoundRow, type CompoundIngredient, type NestedSubstance } from "@/app/[locale]/components/compound-row";
import { CompoundSearchInput } from "@/app/[locale]/components/compound-search-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addCompoundToFormula,
  removeCompoundFromFormula,
  updateCompoundInFormula,
  getCompoundsForFormula,
  type CompoundSearchResult,
} from "@/actions/compounds";
import { projectTypeToDomain } from "@/lib/domain-filter";

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
    color: "hsl(330 50% 70%)", // Soft pink
  },
} satisfies ChartConfig;

interface FlavorProfileChartProps {
  formulaId: number;
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
    editProfile: string;
    hideControls: string;
  };
}

function FlavorProfileChart({ formulaId, initialProfile, readOnly = false, translations }: FlavorProfileChartProps) {
  const [profile, setProfile] = useState<FlavorProfileAttribute[]>(
    initialProfile && initialProfile.length > 0 ? initialProfile : DEFAULT_FLAVOR_PROFILE
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAttribute, setNewAttribute] = useState("");
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [showSliders, setShowSliders] = useState(false);

  // Autosave with debounce
  useEffect(() => {
    if (!hasChanges || readOnly) return;

    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateFlavorProfile(formulaId, profile);
        setHasChanges(false);
      } catch (error) {
        console.error("Error auto-saving flavor profile:", error);
        toast.error(translations.failedToSaveProfile);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(saveTimer);
  }, [profile, hasChanges, readOnly, formulaId, translations.failedToSaveProfile]);

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

  return (
    <div className="space-y-4">
      {/* Radar Chart - centered when sliders hidden */}
      <div className={cn(
        "flex gap-6",
        showSliders ? "flex-col md:flex-row" : "flex-col items-center"
      )}>
        <div className={cn("shrink-0", !showSliders && "mx-auto")}>
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
                fill="hsl(330 55% 75%)"
                fillOpacity={0.35}
                stroke="hsl(330 50% 60%)"
                strokeWidth={1.5}
                dot={{ r: 3, fillOpacity: 0.9, fill: "hsl(330 55% 55%)" }}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        {/* Attribute Controls - toggleable */}
        {showSliders && (
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
        )}
      </div>

      {/* Toggle button and autosave indicator */}
      <div className="flex items-center justify-between pt-2 border-t">
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSliders(!showSliders)}
            className="text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showSliders ? translations.hideControls : translations.editProfile}
          </Button>
        )}
        {readOnly && <div />}
        {!readOnly && isSaving && (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            {translations.saving}
          </span>
        )}
      </div>
    </div>
  );
}

interface FlavorContentProps {
  flavor: Formula;
  setFlavor: React.Dispatch<React.SetStateAction<Formula | null>>;
  isOwner: boolean;
  isSharedWithMe: boolean;
  sharedBy?: { username: string | null; email: string } | null;
}

function FlavorContent({ flavor, setFlavor, isOwner, isSharedWithMe, sharedBy }: FlavorContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Sharing");
  const tFormula = useTranslations("FormulaDetail");
  const tCosmetics = useTranslations("Cosmetics");
  const [currentStatus, setCurrentStatus] = useState<StatusValue>(
    (flavor.status as StatusValue) || "draft"
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Substance details modal state
  const [selectedSubstanceForModal, setSelectedSubstanceForModal] = useState<SubstanceForModal | null>(null);
  const [isSubstanceModalOpen, setIsSubstanceModalOpen] = useState(false);

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

  // Project-type-aware default column visibility
  const getDefaultVisibleColumns = (projectType: string | null): Record<string, boolean> => {
    const base = {
      fema_number: false,
      common_name: true,
      concentration: true,
      is_natural: false,
      odor: false,
      olfactory_taste_notes: false,
      functional_groups: false,
      flavor_profile: false,
      cas_number: false,
      supplier: false,
      dilution: false,
      price_per_kg: false,
      pyramid_position: false,
      phase: false,
      inci_name: false,
      cosmetic_role: false,
    };

    switch (projectType) {
      case "flavor":
        return { ...base, fema_number: true, is_natural: true, odor: true, flavor_profile: true };
      case "perfume":
        return { ...base, pyramid_position: true, odor: true, olfactory_taste_notes: true, dilution: true };
      case "cosmetic":
        return { ...base, phase: true, inci_name: true, concentration: true, cosmetic_role: true };
      default:
        return { ...base, fema_number: true, is_natural: true, odor: true };
    }
  };

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    getDefaultVisibleColumns(flavor.project_type)
  );

  // All possible columns for the dropdown
  const allColumns = [
    { key: "fema_number", label: tFormula("femaNumber") },
    { key: "common_name", label: tFormula("commonName") },
    { key: "phase", label: tCosmetics("phase") },
    { key: "pyramid_position", label: tFormula("pyramidPosition") || "Pyramid" },
    { key: "concentration", label: tFormula("concentration") },
    { key: "inci_name", label: tCosmetics("inciName") || "INCI" },
    { key: "cosmetic_role", label: tCosmetics("cosmeticRole") || "Role" },
    { key: "is_natural", label: tFormula("naturalSynthetic") },
    { key: "odor", label: tFormula("odor") },
    { key: "olfactory_taste_notes", label: tFormula("odorNotes") },
    { key: "functional_groups", label: tFormula("functionalGroups") },
    { key: "flavor_profile", label: tFormula("flavorProfileColumn") },
    { key: "cas_number", label: tFormula("casNumber") },
    { key: "supplier", label: tFormula("supplier") },
    { key: "dilution", label: tFormula("dilution") },
    { key: "price_per_kg", label: tFormula("pricePerKg") },
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

  // Hide all optional columns (reset to project-type defaults)
  const hideOptionalColumns = () => {
    setVisibleColumns(getDefaultVisibleColumns(flavor.project_type));
  };

  const [femaNumberToAdd, setfemaNumberToAdd] = useState("");
  const [concentration, setConcentration] = useState("");
  const [unit, setUnit] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dilution, setDilution] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [pyramidPosition, setPyramidPosition] = useState("");

  // Edit substance state
  const [editingSubstanceId, setEditingSubstanceId] = useState<number | null>(null);
  const [editConcentration, setEditConcentration] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editDilution, setEditDilution] = useState("");
  const [editPricePerKg, setEditPricePerKg] = useState("");
  const [editPyramidPosition, setEditPyramidPosition] = useState("");

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

  // First-time search hint state
  const [showSearchHint, setShowSearchHint] = useState(false);
  const [searchHintOpen, setSearchHintOpen] = useState(false);

  // Compound/ingredient state
  const [isAddCompoundDialogOpen, setIsAddCompoundDialogOpen] = useState(false);
  const [ingredientFormulas, setIngredientFormulas] = useState<CompoundIngredient[]>(
    (flavor as { ingredientFormulas?: CompoundIngredient[] }).ingredientFormulas || []
  );
  const [nestedSubstancesMap, setNestedSubstancesMap] = useState<Record<number, NestedSubstance[]>>({});
  const [compoundConcentration, setCompoundConcentration] = useState("");
  const [compoundUnit, setCompoundUnit] = useState("g/kg");

  // Check localStorage for first-time hint
  useEffect(() => {
    const hasSeenHint = localStorage.getItem("oumamie_search_hint_seen");
    if (!hasSeenHint && isOwner) {
      setShowSearchHint(true);
      // Auto-open tooltip after a short delay
      const timer = setTimeout(() => setSearchHintOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isOwner]);

  const dismissSearchHint = () => {
    setShowSearchHint(false);
    setSearchHintOpen(false);
    localStorage.setItem("oumamie_search_hint_seen", "true");
  };

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
        const domain = projectTypeToDomain(flavor.project_type || "flavor");
        const response = await searchSubstances(searchQuery, category, 1, 10, domain);
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
  }, [searchQuery, activeSearchField, flavor.project_type]);

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
      const result = await addSubstanceToFormula(flavor.formula_id, {
        fema_number: parseInt(femaNumberToAdd),
        concentration: concentration ? parseFloat(concentration) : null,
        unit: unit || null,
        order_index: flavor.substances?.length || 0,
        supplier: supplier || null,
        dilution: dilution || null,
        price_per_kg: pricePerKg ? parseFloat(pricePerKg) : null,
        pyramid_position: pyramidPosition || null,
      });

      // Update local state with new substance
      const newSubstanceEntry: SubstanceInFormula = {
        substance_id: selectedSubstance.substance_id,
        concentration: concentration ? parseFloat(concentration) : 0,
        unit: (unit || "g/kg") as ConcentrationUnitValue,
        order_index: flavor.substances?.length || 0,
        supplier: supplier || null,
        dilution: dilution || null,
        price_per_kg: pricePerKg ? parseFloat(pricePerKg) : null,
        pyramid_position: (pyramidPosition || null) as "top" | "heart" | "base" | null,
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

      setFlavor((prev): Formula | null => {
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
      setPyramidPosition("");
    } catch (error) {
      console.error("Error adding substance:", error);
    }
  };

  const handleRemoveSubstance = async (substanceId: number) => {
    try {
      await removeSubstanceFromFormula(flavor.formula_id, substanceId);

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

  // Compound handlers
  const handleAddCompound = async (compound: CompoundSearchResult) => {
    if (!compoundConcentration) {
      toast.error("Please enter a concentration");
      return;
    }

    try {
      const maxOrderIndex = Math.max(
        ...(flavor.substances?.map((s) => s.order_index) || [0]),
        ...ingredientFormulas.map((i) => i.order_index),
        -1
      );

      const result = await addCompoundToFormula(
        flavor.formula_id,
        compound.formula_id,
        {
          concentration: parseFloat(compoundConcentration),
          unit: compoundUnit,
          order_index: maxOrderIndex + 1,
        }
      );

      // Add to local state
      const newIngredient: CompoundIngredient = {
        ingredient_formula_id: compound.formula_id,
        concentration: parseFloat(compoundConcentration),
        unit: compoundUnit,
        order_index: maxOrderIndex + 1,
        ingredient: {
          formula_id: compound.formula_id,
          name: compound.name,
          description: compound.description,
          base_unit: "g/kg",
          status: "published",
          version: 1,
          substance_count: compound.ingredient_count,
        },
      };

      setIngredientFormulas((prev) => [...prev, newIngredient]);

      // Clear form and close dialog
      setCompoundConcentration("");
      setCompoundUnit("g/kg");
      setIsAddCompoundDialogOpen(false);

      toast.success(`Added ${compound.name} as compound ingredient`);
    } catch (error) {
      console.error("Error adding compound:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add compound");
    }
  };

  const handleRemoveCompound = async (ingredientFormulaId: number) => {
    try {
      await removeCompoundFromFormula(flavor.formula_id, ingredientFormulaId);

      setIngredientFormulas((prev) =>
        prev.filter((i) => i.ingredient_formula_id !== ingredientFormulaId)
      );

      toast.success("Compound removed");
    } catch (error) {
      console.error("Error removing compound:", error);
      toast.error("Failed to remove compound");
    }
  };

  const handleUpdateCompoundConcentration = async (
    ingredientFormulaId: number,
    concentration: number,
    unit: string
  ) => {
    try {
      await updateCompoundInFormula(flavor.formula_id, ingredientFormulaId, {
        concentration,
        unit,
      });

      setIngredientFormulas((prev) =>
        prev.map((i) =>
          i.ingredient_formula_id === ingredientFormulaId
            ? { ...i, concentration, unit }
            : i
        )
      );

      toast.success("Compound updated");
    } catch (error) {
      console.error("Error updating compound:", error);
      toast.error("Failed to update compound");
    }
  };

  const startEditingSubstance = (substance: SubstanceInFormula) => {
    setEditingSubstanceId(substance.substance_id);
    setEditConcentration(substance.concentration?.toString() || "");
    setEditUnit(substance.unit || "");
    setEditSupplier(substance.supplier || "");
    setEditDilution(substance.dilution || "");
    setEditPricePerKg(substance.price_per_kg?.toString() || "");
    setEditPyramidPosition(substance.pyramid_position || "");
  };

  const cancelEditingSubstance = () => {
    setEditingSubstanceId(null);
    setEditConcentration("");
    setEditUnit("");
    setEditSupplier("");
    setEditDilution("");
    setEditPricePerKg("");
    setEditPyramidPosition("");
  };

  const handleSaveSubstance = async (substanceId: number) => {
    try {
      const { updateSubstanceInFormula } = await import("@/actions/formulas");
      await updateSubstanceInFormula(flavor.formula_id, substanceId, {
        concentration: editConcentration ? parseFloat(editConcentration) : null,
        unit: editUnit || null,
        supplier: editSupplier || null,
        dilution: editDilution || null,
        price_per_kg: editPricePerKg ? parseFloat(editPricePerKg) : null,
        pyramid_position: editPyramidPosition || null,
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
                  pyramid_position: (editPyramidPosition || null) as "top" | "heart" | "base" | null,
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

  const handleSetPyramidPosition = async (substanceId: number, position: "top" | "heart" | "base" | null) => {
    try {
      const { updateSubstanceInFormula } = await import("@/actions/formulas");
      await updateSubstanceInFormula(flavor.formula_id, substanceId, {
        pyramid_position: position,
      });

      // Update local state
      setFlavor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: prev.substances?.map((s) =>
            s.substance_id === substanceId
              ? { ...s, pyramid_position: position }
              : s
          ) || [],
        };
      });

      toast.success(position
        ? tFormula("pyramidPositionSet", { position: PYRAMID_POSITION_OPTIONS.find(o => o.value === position)?.label || position })
        : tFormula("pyramidPositionCleared")
      );
    } catch (error) {
      console.error("Error setting pyramid position:", error);
      toast.error(tFormula("failedToSetPyramidPosition"));
    }
  };

  const handleSetPhase = async (substanceId: number, phase: string | null) => {
    try {
      await updateSubstancePhase(flavor.formula_id, substanceId, phase);

      // Update local state
      setFlavor((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          substances: prev.substances?.map((s) =>
            s.substance_id === substanceId
              ? { ...s, phase: phase }
              : s
          ) || [],
        };
      });
    } catch {
      toast.error(tFormula("failedToUpdatePhase"));
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
      await removeSubstanceFromFormula(flavor.formula_id, oldSubstanceId);

      // Add new substance with same concentration
      await addSubstanceToFormula(flavor.formula_id, {
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
      toast.success(tFormula("swappedTo", { name: newSubstance.common_name }));
    } catch (error) {
      console.error("Error swapping substance:", error);
      toast.error(tFormula("failedToSwap"));
    }
  };

  const handleStatusChange = async (newStatus: StatusValue) => {
    if (newStatus === currentStatus) return;

    setIsUpdatingStatus(true);
    try {
      await updateFormulaStatus(flavor.formula_id, newStatus);
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
      const newFormula = await duplicateFormula(flavor.formula_id);
      toast.success(tFormula("formulaDuplicated"));
      router.push(`/${locale}/formulas/${newFormula.formula_id}`);
    } catch (error) {
      console.error("Error duplicating formula:", error);
      toast.error(tFormula("failedToDuplicate"));
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFormula(flavor.formula_id);
      toast.success(tFormula("formulaDeleted"));
      router.push(`/${locale}/formulas`);
    } catch (error) {
      console.error("Error deleting formula:", error);
      toast.error(tFormula("failedToDelete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenSubstanceModal = (substance: Substance) => {
    setSelectedSubstanceForModal({
      substance_id: substance.substance_id,
      fema_number: substance.fema_number ?? 0,
      common_name: substance.common_name ?? "",
      is_natural: substance.is_natural ?? undefined,
      synthetic: substance.synthetic ?? undefined,
      cas_id: substance.cas_id ?? undefined,
      odor: substance.odor ?? undefined,
      functional_groups: substance.functional_groups ?? undefined,
      flavor_profile: substance.flavor_profile ?? undefined,
      fema_flavor_profile: substance.fema_flavor_profile ?? undefined,
      taste: substance.taste ?? undefined,
      olfactory_taste_notes: substance.olfactory_taste_notes ?? undefined,
      pubchem_cid: substance.pubchem_id?.toString() ?? undefined,
      molecular_formula: substance.molecular_formula ?? undefined,
      molecular_weight: substance.molecular_weight ?? undefined,
      exact_mass: substance.exact_mass ?? undefined,
      iupac_name: substance.iupac_name ?? undefined,
      smile: substance.smile ?? undefined,
      inchi: substance.inchi ?? undefined,
      xlogp: substance.xlogp ?? undefined,
      description: substance.description ?? undefined,
      melting_point_c: substance.melting_point_c ?? undefined,
      boiling_point_c: substance.boiling_point_c ?? undefined,
      solubility: substance.solubility ?? undefined,
      food_additive_classes: substance.food_additive_classes ?? undefined,
      alternative_names: substance.alternative_names ?? undefined,
      volatility_class: substance.volatility_class ?? undefined,
      olfactive_family: substance.olfactive_family ?? undefined,
      odor_profile_tags: substance.odor_profile_tags ?? undefined,
      substantivity: substance.substantivity ?? undefined,
      performance_notes: substance.performance_notes ?? undefined,
      uses_in_perfumery: substance.uses_in_perfumery ?? undefined,
      use_level: substance.use_level ?? undefined,
      stability_notes: substance.stability_notes ?? undefined,
      price_range: substance.price_range ?? undefined,
      botanical_name: substance.botanical_name ?? undefined,
      extraction_process: substance.extraction_process ?? undefined,
      major_components: substance.major_components ?? undefined,
      vegan: substance.vegan ?? undefined,
      appearance: substance.appearance ?? undefined,
      density: substance.density ?? undefined,
      refractive_index: substance.refractive_index ?? undefined,
      flash_point: substance.flash_point ?? undefined,
      vapor_pressure: substance.vapor_pressure ?? undefined,
      domain: substance.domain ?? undefined,
      inchikey: substance.inchikey ?? undefined,
    });
    setIsSubstanceModalOpen(true);
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
          <Link href={`/${locale}/formulas`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">{flavor.name}</h1>
        <div className="flex items-center gap-2">
          {/* EU Compliance Check - available to all with access */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/formulas/${flavor.formula_id}/compliance`}>
              <Shield className="h-4 w-4 mr-2" />
              {tFormula("checkEuCompliance")}
            </Link>
          </Button>
          {/* Owner-only actions */}
          {isOwner && (
            <>
              <ShareFormulaDialog
                formulaId={flavor.formula_id}
                formulaName={flavor.name}
              />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/formulas/${flavor.formula_id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {tFormula("edit")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? tFormula("duplicating") : tFormula("duplicate")}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tFormula("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tFormula("deleteFormula")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {tFormula("deleteConfirmation", { name: flavor.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tFormula("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? tFormula("deleting") : tFormula("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {/* Duplicate button for shared formulas */}
          {isSharedWithMe && !isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              <Copy className="h-4 w-4 mr-2" />
              {isDuplicating ? t("duplicating") : t("duplicateToMyFormulas")}
            </Button>
          )}
        </div>
      </div>

      {/* Variation pills - separate row for clarity */}
      {isOwner && (
        <VariationPills formulaId={flavor.formula_id} />
      )}

      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground">{flavor.description}</p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground items-center">
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
                    {tFormula(option.labelKey)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {flavor.is_public ? tFormula("public") : tFormula("private")}
          </Badge>
          {flavor.version !== null && (
            <Badge variant="outline">v{flavor.version}</Badge>
          )}
          {flavor.base_unit && (
            <Badge variant="outline">{flavor.base_unit}</Badge>
          )}
          {categoryName && (
            <Badge variant="outline" className="gap-1">
              <Tag className="h-3 w-3" />
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Collapsible metadata details */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <Settings2 className="h-4 w-4" />
              <span>{tFormula("flavorDetails")}</span>
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{tFormula("created")}:</span>
                  <span className="font-medium">{new Date(flavor.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{tFormula("lastUpdated")}:</span>
                  <span className="font-medium">{new Date(flavor.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{tFormula("userId")}:</span>
                  <span className="font-medium truncate max-w-[150px]" title={flavor.user_id ?? undefined}>{flavor.user_id}</span>
                </div>
                {!categoryName && flavor.category_id && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{tFormula("category")}:</span>
                    <span className="font-medium">{tFormula("loading")}</span>
                  </div>
                )}
                {!categoryName && !flavor.category_id && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{tFormula("category")}:</span>
                    <span className="text-muted-foreground italic">{tFormula("none")}</span>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Substances Card - Moved up for prominence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tFormula("substances")} ({flavor.substances?.length || 0})</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{tFormula("showAll")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideOptionalColumns}
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">{tFormula("hideOptional")}</span>
            </Button>
            {isOwner && (
              <Dialog open={isAddCompoundDialogOpen} onOpenChange={setIsAddCompoundDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">{tFormula("addCompound") || "Add Compound"}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{tFormula("addCompound") || "Add Compound"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tFormula("searchFormulas") || "Search formulas..."}</label>
                      <CompoundSearchInput
                        onSelect={handleAddCompound}
                        excludeFormulaId={flavor.formula_id}
                        placeholder={tFormula("searchFormulas") || "Search formulas..."}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tFormula("concentration") || "Concentration"}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="100"
                          className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
                          value={compoundConcentration}
                          onChange={(e) => setCompoundConcentration(e.target.value)}
                        />
                        <select
                          className="w-24 px-2 py-2 border rounded-md text-sm bg-background"
                          value={compoundUnit}
                          onChange={(e) => setCompoundUnit(e.target.value)}
                        >
                          <option value="g/kg">g/kg</option>
                          <option value="%(v/v)">%</option>
                          <option value="g/L">g/L</option>
                          <option value="mL/L">mL/L</option>
                          <option value="ppm">ppm</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  {tFormula("columns")} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{tFormula("toggleColumns")}</DropdownMenuLabel>
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
              <p>{tFormula("noSubstancesYet")}</p>
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
                                    <p className="font-medium">{tFormula("concentrationTooltipTitle")}</p>
                                    <p className="text-xs mt-1">{tFormula("concentrationTooltipDesc")}</p>
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
                                    <p className="font-medium">{tFormula("dilutionTooltipTitle")}</p>
                                    <p className="text-xs mt-1">{tFormula("dilutionTooltipDesc")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : (
                              column.label
                            )}
                          </TableHead>
                        )
                    )}
                    {isOwner && <TableHead className="text-right">{tFormula("actions")}</TableHead>}
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
                          {substance.substance ? (
                            <button
                              type="button"
                              className="text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                              onClick={() => handleOpenSubstanceModal(substance.substance!)}
                            >
                              {substance.substance.common_name || "N/A"}
                            </button>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.phase && (
                        <TableCell>
                          <PillSelect
                            value={substance.phase}
                            options={COSMETIC_PHASE_OPTIONS.map((p) => ({
                              value: p.value,
                              label: tCosmetics(p.value === "cool_down" ? "coolDownPhase" : `${p.value}Phase`),
                            }))}
                            onChange={(val) => handleSetPhase(substance.substance_id, val)}
                            unassignedLabel={tCosmetics("unassigned")}
                            disabled={!isOwner}
                            getOptionClassName={(value) => {
                              const colors = COSMETIC_PHASE_COLORS[value as CosmeticPhaseValue];
                              return colors ? `${colors.bg} ${colors.text}` : "";
                            }}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.pyramid_position && (
                        <TableCell>
                          <PillSelect
                            value={substance.pyramid_position}
                            options={PYRAMID_POSITION_OPTIONS}
                            onChange={(val) => handleSetPyramidPosition(substance.substance_id, val as "top" | "heart" | "base" | null)}
                            disabled={!isOwner}
                            getOptionClassName={(value) => {
                              const colors: Record<string, string> = {
                                top: "bg-sky-100 text-sky-700",
                                heart: "bg-rose-100 text-rose-700",
                                base: "bg-amber-100 text-amber-700",
                              };
                              return colors[value] || "";
                            }}
                          />
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
                      {visibleColumns.inci_name && (
                        <TableCell className="text-sm text-muted-foreground">
                          {substance.substance?.inci_name || "-"}
                        </TableCell>
                      )}
                      {visibleColumns.cosmetic_role && (
                        <TableCell>
                          {substance.substance?.cosmetic_role && (substance.substance.cosmetic_role as string[]).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(substance.substance.cosmetic_role as string[]).map((role: string) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className={cn("text-xs", COSMETIC_ROLE_COLORS[role])}
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
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
                              ? tFormula("natural")
                              : substance.substance?.is_natural === false
                              ? tFormula("synthetic")
                              : tFormula("unknown")}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.odor && (
                        <TableCell className="max-w-[120px]">
                          <span className="block truncate" title={substance.substance?.odor || undefined}>
                            {substance.substance?.odor || "N/A"}
                          </span>
                        </TableCell>
                      )}
                      {visibleColumns.olfactory_taste_notes && (
                        <TableCell className="max-w-[120px]">
                          <span className="block truncate" title={substance.substance?.olfactory_taste_notes || undefined}>
                            {substance.substance?.olfactory_taste_notes || "N/A"}
                          </span>
                        </TableCell>
                      )}
                      {visibleColumns.functional_groups && (
                        <TableCell className="max-w-[120px]">
                          <span className="block truncate" title={substance.substance?.functional_groups || undefined}>
                            {substance.substance?.functional_groups || "N/A"}
                          </span>
                        </TableCell>
                      )}
                      {visibleColumns.flavor_profile && (
                        <TableCell className="max-w-[150px]">
                          <span className="block truncate" title={substance.substance?.flavor_profile || undefined}>
                            {substance.substance?.flavor_profile || "N/A"}
                          </span>
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
                              placeholder={tFormula("supplier")}
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
                              placeholder={tFormula("dilutionPlaceholder")}
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
                              placeholder={tFormula("pricePlaceholder")}
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
                                title={tFormula("save")}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEditingSubstance}
                                title={tFormula("cancel")}
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
                                <DropdownMenuLabel>{tFormula("actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <button
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                                  onClick={() => startEditingSubstance(substance)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  {tFormula("edit")}
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                                  onClick={() => handleLoadVariations(substance.substance_id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  {tFormula("variations")}
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
                                  {tFormula("delete")}
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
                              {tFormula("suggestedVariations", { name: substance.substance?.common_name || "" })}
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
                                {tFormula("loadingVariations")}
                              </div>
                            ) : substanceVariations.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                {tFormula("noVariationsFound")}
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

                  {/* Compound ingredient rows */}
                  {ingredientFormulas.map((compound) => (
                    <CompoundRow
                      key={`compound-${compound.ingredient_formula_id}`}
                      compound={compound}
                      nestedSubstances={nestedSubstancesMap[compound.ingredient_formula_id] || []}
                      visibleColumns={visibleColumns}
                      isOwner={isOwner}
                      onRemove={handleRemoveCompound}
                      onConcentrationSave={handleUpdateCompoundConcentration}
                      translations={{
                        compound: tFormula("compound") || "Compound",
                        ingredients: tFormula("ingredients") || "Ingredients",
                        edit: tFormula("edit"),
                        delete: tFormula("delete"),
                        actions: tFormula("actions"),
                        viewFormula: tFormula("viewFormula") || "View Formula",
                        save: tFormula("save"),
                        cancel: tFormula("cancel"),
                        calculatedConcentration: tFormula("calculatedConcentration") || "Calculated contribution",
                      }}
                    />
                  ))}

                  {/* Add substance row - only for owners */}
                  {isOwner && (
                    <TableRow className="bg-muted/30">
                      {visibleColumns.fema_number && (
                        <TableCell className="text-muted-foreground text-sm">
                          <Plus className="h-4 w-4" />
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
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder={tFormula("searchName")}
                                className="w-full px-2 py-1 border rounded text-sm bg-background"
                                value={activeSearchField === "common_name" ? searchQuery : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => handleSearchFocus("common_name")}
                                onBlur={handleSearchBlur}
                              />
                              <Tooltip open={showSearchHint ? searchHintOpen : undefined} onOpenChange={showSearchHint ? setSearchHintOpen : undefined}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => showSearchHint && setSearchHintOpen(!searchHintOpen)}
                                    className={showSearchHint ? "animate-pulse" : ""}
                                  >
                                    <HelpCircle className={`h-3.5 w-3.5 cursor-help shrink-0 transition-colors ${showSearchHint ? "text-primary" : "text-muted-foreground"}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-left">
                                  <p className="font-medium">{tFormula("searchNameHintTitle")}</p>
                                  <p className="text-xs mt-1">{tFormula("searchNameHintDesc")}</p>
                                  {showSearchHint && (
                                    <button
                                      type="button"
                                      onClick={dismissSearchHint}
                                      className="mt-2 text-xs text-primary hover:underline"
                                    >
                                      OK
                                    </button>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.phase && (
                        <TableCell className="text-muted-foreground text-sm">-</TableCell>
                      )}
                      {visibleColumns.pyramid_position && (
                        <TableCell className="text-muted-foreground text-sm">-</TableCell>
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
                      {visibleColumns.inci_name && (
                        <TableCell className="text-muted-foreground text-sm">—</TableCell>
                      )}
                      {visibleColumns.cosmetic_role && (
                        <TableCell className="text-muted-foreground text-sm">—</TableCell>
                      )}
                      {visibleColumns.is_natural && (
                        <TableCell className="text-muted-foreground text-sm">
                          {selectedSubstance ? "—" : "—"}
                        </TableCell>
                      )}
                      {visibleColumns.odor && (
                        <TableCell className="relative max-w-[120px]">
                          {selectedSubstance ? (
                            <span className="block text-sm truncate" title={selectedSubstance.odor || undefined}>{selectedSubstance.odor || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFormula("searchOdor")}
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
                        <TableCell className="relative max-w-[120px]">
                          {selectedSubstance ? (
                            <span className="block text-sm truncate" title={selectedSubstance.olfactory_taste_notes || undefined}>{selectedSubstance.olfactory_taste_notes || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFormula("searchNotes")}
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
                        <TableCell className="text-muted-foreground text-sm max-w-[120px]">
                          —
                        </TableCell>
                      )}
                      {visibleColumns.flavor_profile && (
                        <TableCell className="relative max-w-[150px]">
                          {selectedSubstance ? (
                            <span className="block text-sm truncate" title={selectedSubstance.flavor_profile || undefined}>{selectedSubstance.flavor_profile || "—"}</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder={tFormula("searchFlavor")}
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
                                placeholder={tFormula("searchCas")}
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
                            placeholder={tFormula("supplier")}
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
                            placeholder={tFormula("dilutionPlaceholder")}
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
                            placeholder={tFormula("pricePlaceholder")}
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
                          title={!femaNumberToAdd ? tFormula("selectSubstanceFirst") : tFormula("addSubstance")}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {tFormula("add")}
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
                        {visibleColumns.phase && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.pyramid_position && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.concentration && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.inci_name && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.cosmetic_role && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.is_natural && (
                          <TableCell className="text-muted-foreground">—</TableCell>
                        )}
                        {visibleColumns.odor && (
                          <TableCell className="text-sm max-w-[120px]">
                            <span className="block truncate" title={substance.odor || undefined}>{substance.odor || "—"}</span>
                          </TableCell>
                        )}
                        {visibleColumns.olfactory_taste_notes && (
                          <TableCell className="text-sm max-w-[120px]">
                            <span className="block truncate" title={substance.olfactory_taste_notes || undefined}>{substance.olfactory_taste_notes || "—"}</span>
                          </TableCell>
                        )}
                        {visibleColumns.functional_groups && (
                          <TableCell className="text-muted-foreground max-w-[120px]">—</TableCell>
                        )}
                        {visibleColumns.flavor_profile && (
                          <TableCell className="text-sm max-w-[150px]">
                            <span className="block truncate" title={substance.flavor_profile || undefined}>{substance.flavor_profile || "—"}</span>
                          </TableCell>
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
                          {tFormula("clickToSelect")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {isOwner && showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-sm text-muted-foreground py-4">
                        {tFormula("noSubstancesFound", { query: searchQuery })}
                      </TableCell>
                    </TableRow>
                  )}
                  {isOwner && isSearching && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-sm text-muted-foreground py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          {tFormula("searching")}
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

      {/* Olfactive Pyramid - only shown for perfume projects */}
      {flavor.project_type === "perfume" && flavor.substances && flavor.substances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{tFormula("olfactivePyramid") || "Olfactive Pyramid"}</CardTitle>
          </CardHeader>
          <CardContent>
            <OlfactivePyramid
              substances={flavor.substances.map((s) => ({
                substance_id: s.substance_id,
                common_name: s.substance?.common_name || "Unknown",
                pyramid_position: s.pyramid_position || null,
                concentration: s.concentration,
                unit: s.unit,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Cosmetic Details - only shown for cosmetic projects */}
      {flavor.project_type === "cosmetic" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CosmeticDetailsCard
              formulaId={flavor.formula_id}
              cosmeticProductType={flavor.cosmetic_product_type ?? null}
              targetPh={flavor.target_ph ?? null}
              preservativeSystem={flavor.preservative_system ?? null}
              manufacturingNotes={flavor.manufacturing_notes ?? null}
              isOwner={isOwner}
            />
            {flavor.substances && flavor.substances.length > 0 && (
              <PhaseGroupedView
                substances={flavor.substances.map((s) => ({
                  substance_id: s.substance_id,
                  common_name: s.substance?.common_name || "Unknown",
                  concentration: s.concentration,
                  unit: s.unit,
                  phase: s.phase ?? null,
                  cosmetic_role: s.substance?.cosmetic_role ?? null,
                  inci_name: s.substance?.inci_name ?? null,
                  hlb_value: s.substance?.hlb_value ?? null,
                  hlb_required: s.substance?.hlb_required ?? null,
                }))}
                formulaId={flavor.formula_id}
                cosmeticProductType={flavor.cosmetic_product_type ?? null}
                isOwner={isOwner}
                onSubstanceClick={(substanceId) => {
                  const sub = flavor.substances?.find((s) => s.substance_id === substanceId);
                  if (sub?.substance) handleOpenSubstanceModal(sub.substance);
                }}
              />
            )}
          </div>
          {(flavor.cosmetic_product_type === "emulsion_ow" ||
            flavor.cosmetic_product_type === "emulsion_wo") &&
            flavor.substances &&
            flavor.substances.length > 0 && (
              <HlbCalculator
                substances={flavor.substances.map((s) => ({
                  substance_id: s.substance_id,
                  common_name: s.substance?.common_name || "Unknown",
                  concentration: s.concentration,
                  phase: s.phase ?? null,
                  cosmetic_role: s.substance?.cosmetic_role ?? null,
                  hlb_value: s.substance?.hlb_value ?? null,
                  hlb_required: s.substance?.hlb_required ?? null,
                }))}
              />
            )}
        </>
      )}

      {/* Flavor Profile and Notes - side by side grid for non-cosmetic */}
      {flavor.project_type !== "cosmetic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{tFormula("flavorProfile")}</CardTitle>
            </CardHeader>
            <CardContent>
              <FlavorProfileChart
                formulaId={flavor.formula_id}
                initialProfile={flavor.flavor_profile}
                readOnly={!isOwner}
                translations={{
                  addAttribute: tFormula("addAttribute"),
                  newAttributeName: tFormula("newAttributeName"),
                  add: tFormula("add"),
                  cancel: tFormula("cancel"),
                  saving: tFormula("saving"),
                  saveProfile: tFormula("saveProfile"),
                  minimumAttributes: tFormula("minimumAttributes"),
                  flavorProfileSaved: tFormula("flavorProfileSaved"),
                  failedToSaveProfile: tFormula("failedToSaveProfile"),
                  editProfile: tFormula("editProfile"),
                  hideControls: tFormula("hideControls"),
                }}
              />
            </CardContent>
          </Card>
          <FormulaNotesCard
            formulaId={flavor.formula_id}
            initialNotes={flavor.notes}
            readOnly={!isOwner}
          />
        </div>
      )}

      {/* Notes card for cosmetic projects - full width */}
      {flavor.project_type === "cosmetic" && (
        <FormulaNotesCard
          formulaId={flavor.formula_id}
          initialNotes={flavor.notes}
          readOnly={!isOwner}
        />
      )}

      {/* Substance Details Modal */}
      <SubstanceDetailsModal
        substance={selectedSubstanceForModal}
        open={isSubstanceModalOpen}
        onOpenChange={setIsSubstanceModalOpen}
        showAddToQueue={true}
      />
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
  const tFormula = useTranslations("FormulaDetail");
  const flavorId = parseInt(params.id as string, 10);
  const [flavor, setFlavor] = useState<Formula | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [isSharedWithMe, setIsSharedWithMe] = useState(false);
  const [sharedBy, setSharedBy] = useState<{ username: string | null; email: string } | null>(null);

  // Set breadcrumb label to formula name
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
        setError(tFormula("invalidFlavorId"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFormulaById(flavorId);

        // Transform the data to match your frontend expectations
        const transformedData = {
          formula_id: Number(data.formula.formula_id),
          name: data.formula.name || tFormula("unnamedFlavor"),
          description: data.formula.description || "",
          notes: data.formula.notes || null,
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
          status: data.formula.status || "draft",
          is_public: Boolean(data.formula.is_public),
          version:
            data.formula.version !== null ? Number(data.formula.version) : null,
          base_unit: data.formula.base_unit || "",
          category_id:
            data.formula.category_id !== null
              ? Number(data.formula.category_id)
              : null,
          flavor_profile: data.formula.flavor_profile || null,
          project_type: data.formula.project_type || "flavor",
          concentration_type: data.formula.concentration_type || null,
          created_at: data.formula.created_at || new Date().toISOString(),
          updated_at: data.formula.updated_at || new Date().toISOString(),
          user_id: data.formula.user_id || "Unknown",
        } as Formula;

        setFlavor(transformedData);
        setIsOwner(data.isOwner ?? true);
        setIsSharedWithMe(data.isSharedWithMe ?? false);
        setSharedBy(data.sharedBy ?? null);
        setError(null);
      } catch (err) {
        console.error("Error fetching flavor:", err);
        setError(tFormula("failedToLoadFlavor"));
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
            <h2 className="text-xl font-semibold mb-2">{tFormula("error")}</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              {tFormula("goBack")}
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
            <h2 className="text-xl font-semibold mb-2">{tFormula("flavorNotFound")}</h2>
            <p className="text-muted-foreground">
              {tFormula("flavorNotFoundDesc")}
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              {tFormula("goBack")}
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

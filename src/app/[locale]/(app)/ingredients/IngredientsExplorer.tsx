"use client";

import { useState, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import {
  INGREDIENT_CATEGORIES,
  searchIngredients,
  getTotalIngredientCount,
  type IngredientCategory,
  type CosmeticIngredient,
} from "@/constants/cosmetic-ingredients";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/app/[locale]/components/ui/resizable";
import { cn } from "@/lib/utils";
import { FormulaBuilderPanel } from "./FormulaBuilderPanel";
import {
  Search,
  X,
  Droplets,
  Leaf,
  Layers,
  Droplet,
  Sparkles,
  Waves,
  ShieldCheck,
  Wind,
  Zap,
  SlidersHorizontal,
  Link,
  Beaker,
  Palette,
  CircleDot,
  Cylinder,
  Shield,
  Sun,
  Milk,
  FlaskConical,
  Hand,
  TestTube,
  Plus,
  Check,
  FlaskRound,
  Trash2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

// ─── Icon map ───
const ICON_MAP: Record<string, LucideIcon> = {
  Droplets, Leaf, Layers, Droplet, Sparkles, Waves, ShieldCheck, Wind,
  Zap, SlidersHorizontal, Link, Beaker, Palette, CircleDot, Cylinder,
  Shield, Sun, Milk, FlaskConical, Hand,
};

function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = ICON_MAP[iconName] || Beaker;
  return <Icon className={className} />;
}

// ─── Role styling ───
const ROLE_LABELS: Record<string, string> = {
  emulsifier: "Emulsifier", emollient: "Emollient", structure: "Structure",
  humectant: "Humectant", active: "Active", sensory: "Sensory",
  preservative: "Preservative", surfactant: "Surfactant", thickener: "Thickener",
  colorant: "Colorant", uv_filter: "UV Filter", antioxidant: "Antioxidant",
  chelating: "Chelating", ph_adjuster: "pH Adjuster", solvent: "Solvent",
  fragrance: "Fragrance",
};

const ROLE_COLORS: Record<string, string> = {
  emulsifier: "bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100",
  emollient: "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  structure: "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100",
  humectant: "bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100",
  active: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  sensory: "bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100",
  preservative: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
  surfactant: "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
  thickener: "bg-teal-200 text-teal-900 dark:bg-teal-900 dark:text-teal-100",
  colorant: "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100",
  uv_filter: "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  antioxidant: "bg-lime-200 text-lime-900 dark:bg-lime-900 dark:text-lime-100",
  chelating: "bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-100",
  ph_adjuster: "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  solvent: "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  fragrance: "bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-100",
};

// ─── Main component ───

export function IngredientsExplorer() {
  const t = useTranslations("IngredientsEncyclopedia");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, CosmeticIngredient>>(new Map());
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelRect, setPanelRect] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (panelOpen && containerRef.current) {
      const main = containerRef.current.closest("main");
      if (main) {
        const rect = main.getBoundingClientRect();
        setPanelRect({ top: rect.top, left: rect.left });
      }
    }
  }, [panelOpen]);

  const totalCount = useMemo(() => getTotalIngredientCount(), []);
  const selectedSet = useMemo(() => new Set(selectedIngredients.keys()), [selectedIngredients]);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return null;
    return searchIngredients(searchQuery.trim());
  }, [searchQuery]);

  const isSearching = searchResults !== null;

  // Flat list of all ingredients with category info
  const allRows = useMemo(() => {
    const rows: Array<{ category: IngredientCategory; ingredient: CosmeticIngredient }> = [];
    for (const cat of INGREDIENT_CATEGORIES) {
      for (const ing of cat.ingredients) {
        rows.push({ category: cat, ingredient: ing });
      }
    }
    return rows;
  }, []);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (isSearching && searchResults) return searchResults;
    if (activeCategory) return allRows.filter((r) => r.category.key === activeCategory);
    return allRows;
  }, [isSearching, searchResults, activeCategory, allRows]);

  const toggleIngredient = useCallback((ingredient: CosmeticIngredient) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      if (next.has(ingredient.inci_name)) next.delete(ingredient.inci_name);
      else next.set(ingredient.inci_name, ingredient);
      return next;
    });
  }, []);

  const removeIngredient = useCallback((inciName: string) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.delete(inciName);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelectedIngredients(new Map()), []);

  const handleCategoryClick = useCallback((catKey: string) => {
    setSearchQuery("");
    if (activeCategory === catKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catKey);
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [activeCategory]);

  // ─── Content ───
  const ingredientsContent = (
    <div className="space-y-6">
      {/* Intro + substances link */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {t("totalIngredients", { count: totalCount, categories: INGREDIENT_CATEGORIES.length })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("substancesNote")}{" "}
          <NextLink
            href={`/${locale}/substances`}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            {t("substancesLink")}
            <ArrowRight className="h-3 w-3" />
          </NextLink>
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setActiveCategory(null);
          }}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category cards */}
      <div className={cn(
        "grid gap-3",
        panelOpen
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      )}>
        {/* Show All card */}
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:shadow-sm",
            activeCategory === null
              ? "bg-primary/10 border-primary/30 shadow-md ring-1 ring-primary/30"
              : "hover:bg-muted/40"
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
              activeCategory === null
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}>
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{t("showAll")}</p>
              <p className="text-[10px] text-muted-foreground">
                {t("ingredientCount", { count: getTotalIngredientCount() })}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{t("allCategories")}</p>
        </button>

        {INGREDIENT_CATEGORIES.map((cat) => {
          const label = locale === "fr" ? cat.labelFr : cat.label;
          const desc = locale === "fr" ? cat.descriptionFr : cat.description;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryClick(cat.key)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:shadow-sm",
                isActive
                  ? cn(cat.color, cat.borderColor, "shadow-md ring-1", cat.borderColor)
                  : "hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", cat.color, cat.textColor)}>
                  <CategoryIcon iconName={cat.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("ingredientCount", { count: cat.ingredients.length })}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{desc}</p>
            </button>
          );
        })}
      </div>

      {/* Active filter bar */}
      <div ref={tableRef}>
        {isSearching ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {t("searchResults", { count: filteredRows.length, query: searchQuery })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-xs h-7">
              {t("clearSearch")}
            </Button>
          </div>
        ) : activeCategory ? (
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const cat = INGREDIENT_CATEGORIES.find((c) => c.key === activeCategory);
              if (!cat) return null;
              const label = locale === "fr" ? cat.labelFr : cat.label;
              return (
                <>
                  <div className={cn("flex items-center justify-center w-6 h-6 rounded", cat.color, cat.textColor)}>
                    <CategoryIcon iconName={cat.icon} className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    — {t("ingredientCount", { count: filteredRows.length })}
                  </span>
                </>
              );
            })()}
            <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)} className="text-xs h-7 ml-auto">
              {t("showAll")}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10" />
              <TableHead className="min-w-[140px]">{t("name")}</TableHead>
              <TableHead className="min-w-[160px] hidden sm:table-cell">{t("inciName")}</TableHead>
              <TableHead>{t("roles")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("casNumber")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("hlbValue")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("useLevel")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("solubility")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <TestTube className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isSearching ? t("noResults", { query: searchQuery }) : "No ingredients"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(({ category, ingredient }) => {
                const isSelected = selectedSet.has(ingredient.inci_name);
                const rowKey = ingredient.inci_name + (ingredient.cas_id || ingredient.common_name);
                return (
                  <TableRow
                    key={rowKey}
                    className={cn("group transition-colors", isSelected && "bg-primary/[0.04]")}
                  >
                    <TableCell className="w-10 pr-0">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleIngredient(ingredient)}
                              className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full transition-all",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {isSelected ? t("removeFromFormula") : t("addToFormula")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", category.textColor.replace("text-", "bg-"))} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ingredient.common_name}</p>
                          <p className="text-[10px] text-muted-foreground sm:hidden font-mono truncate">
                            {ingredient.inci_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                      <span className="truncate block max-w-[220px]">{ingredient.inci_name}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ingredient.cosmetic_role.map((role) => (
                          <span
                            key={role}
                            className={cn(
                              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none",
                              ROLE_COLORS[role] || "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                            )}
                          >
                            {ROLE_LABELS[role] || role}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                      {ingredient.cas_id || "—"}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-xs">
                      {ingredient.hlb_value !== null
                        ? ingredient.hlb_value
                        : ingredient.hlb_required !== null
                          ? <span className="text-muted-foreground">req. {ingredient.hlb_required}</span>
                          : "—"}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-xs">
                      {ingredient.use_level_min !== null && ingredient.use_level_max !== null
                        ? `${ingredient.use_level_min}–${ingredient.use_level_max}%`
                        : ingredient.use_level_max !== null
                          ? `≤${ingredient.use_level_max}%`
                          : ingredient.use_level_min !== null
                            ? `${ingredient.use_level_min}%+`
                            : "—"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-xs">
                      {ingredient.water_solubility ? (
                        <span className={cn(
                          ingredient.water_solubility === "soluble" && "text-blue-600 dark:text-blue-400",
                          ingredient.water_solubility === "insoluble" && "text-stone-500 dark:text-stone-400",
                          ingredient.water_solubility === "partially" && "text-amber-600 dark:text-amber-400",
                          ingredient.water_solubility === "dispersible" && "text-teal-600 dark:text-teal-400",
                        )}>
                          {ingredient.water_solubility === "soluble" ? t("soluble") :
                           ingredient.water_solubility === "insoluble" ? t("insoluble") :
                           ingredient.water_solubility === "partially" ? t("partially") :
                           t("dispersible")}
                        </span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // ─── Return with resizable panel support ───
  return (
    <div className="relative" ref={containerRef}>
      {panelOpen ? (
        <div
          className="fixed right-0 bottom-0 z-30 bg-background"
          style={{ top: `${panelRect.top}px`, left: `${panelRect.left}px` }}
        >
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize={60} minSize={20}>
              <div className="h-full overflow-y-auto px-4 md:px-6 py-4">
                {ingredientsContent}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <FormulaBuilderPanel
                selectedIngredients={Array.from(selectedIngredients.values())}
                onRemoveIngredient={removeIngredient}
                onClearAll={clearAll}
                onClose={() => setPanelOpen(false)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        ingredientsContent
      )}

      {/* Floating Formula Tray */}
      {selectedIngredients.size > 0 && !panelOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-lg border shadow-lg rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <FlaskRound className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {selectedIngredients.size === 1
                  ? t("selectedIngredients", { count: 1 })
                  : t("selectedIngredientsPlural", { count: selectedIngredients.size })}
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <Button size="sm" onClick={() => setPanelOpen(true)} className="gap-1.5 text-xs">
              <FlaskRound className="h-3.5 w-3.5" />
              {t("openFormulaTray")}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive gap-1">
              <Trash2 className="h-3 w-3" />
              {t("clearSelection")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

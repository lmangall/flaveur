"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { ScrollArea } from "@/app/[locale]/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createFormula } from "@/actions/formulas";
import { findSubstanceByInci, addSubstanceToFormulaById } from "@/actions/substances";
import { searchCompoundFormulas, type CompoundSearchResult } from "@/actions/compounds";
import type { CosmeticIngredient } from "@/constants/cosmetic-ingredients";
import {
  X,
  Plus,
  Search,
  FlaskRound,
  Loader2,
  ArrowRight,
  LogIn,
  Beaker,
  PanelRightClose,
} from "lucide-react";

interface FormulaBuilderPanelProps {
  selectedIngredients: CosmeticIngredient[];
  onRemoveIngredient: (inciName: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

type BuilderMode = "create" | "existing";

export function FormulaBuilderPanel({
  selectedIngredients,
  onRemoveIngredient,
  onClearAll,
  onClose,
}: FormulaBuilderPanelProps) {
  const t = useTranslations("IngredientsEncyclopedia");
  const locale = useLocale();
  const router = useRouter();
  const session = useSession();
  const isAuthenticated = !!session?.data?.user?.id;

  const [mode, setMode] = useState<BuilderMode>("create");
  const [formulaName, setFormulaName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CompoundSearchResult[]>([]);
  const [suggestedFormulas, setSuggestedFormulas] = useState<CompoundSearchResult[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<CompoundSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload user's formulas when switching to "existing" mode
  useEffect(() => {
    if (mode !== "existing" || !isAuthenticated) return;

    let cancelled = false;
    setIsLoadingSuggestions(true);
    searchCompoundFormulas("")
      .then((results) => {
        if (!cancelled) setSuggestedFormulas(results);
      })
      .catch(() => {
        if (!cancelled) setSuggestedFormulas([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSuggestions(false);
      });

    return () => { cancelled = true; };
  }, [mode, isAuthenticated]);

  // Debounced search for existing formulas
  useEffect(() => {
    if (mode !== "existing" || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCompoundFormulas(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, mode]);

  // Which list to display: search results or suggestions
  const displayedFormulas = searchQuery.trim().length > 0 ? searchResults : suggestedFormulas;
  const isLoadingFormulas = searchQuery.trim().length > 0 ? isSearching : isLoadingSuggestions;

  const canSubmit = (() => {
    if (selectedIngredients.length === 0) return false;
    if (mode === "create") return formulaName.trim().length > 0;
    if (mode === "existing") return selectedFormula !== null;
    return false;
  })();

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let formulaId: number;

      if (mode === "create") {
        const result = await createFormula({
          name: formulaName.trim(),
          project_type: "cosmetic",
        });
        formulaId = result.formula.formula_id;
      } else {
        formulaId = selectedFormula!.formula_id;
      }

      // Add each selected ingredient
      let addedCount = 0;
      const notFound: string[] = [];

      for (let i = 0; i < selectedIngredients.length; i++) {
        const ing = selectedIngredients[i];
        try {
          const substance = await findSubstanceByInci(ing.inci_name, ing.cas_id);
          if (substance) {
            await addSubstanceToFormulaById(formulaId, substance.substance_id, i + 1);
            addedCount++;
          } else {
            notFound.push(ing.common_name);
          }
        } catch {
          notFound.push(ing.common_name);
        }
      }

      if (mode === "create") {
        toast.success(t("formulaCreated", { count: addedCount }));
      } else {
        toast.success(t("ingredientsAdded", { count: addedCount }));
      }

      if (notFound.length > 0) {
        toast.warning(
          `${notFound.length} ingredient(s) not found in database: ${notFound.slice(0, 3).join(", ")}${notFound.length > 3 ? "..." : ""}`
        );
      }

      onClearAll();
      onClose();
      router.push(`/${locale}/formulas/${formulaId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create formula");
      setIsSubmitting(false);
    }
  }, [canSubmit, isSubmitting, mode, formulaName, selectedFormula, selectedIngredients, t, onClearAll, onClose, router, locale]);

  return (
    <div className="h-full flex flex-col border-l bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <FlaskRound className="h-4 w-4 text-primary shrink-0" />
          <h3 className="font-semibold text-sm truncate">{t("openFormulaTray")}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {!isAuthenticated ? (
        /* Not authenticated */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted mx-auto">
              <LogIn className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              {t("signInToSave")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                router.push(`/${locale}/sign-in`);
              }}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </div>
        </div>
      ) : (
        /* Authenticated */
        <>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Mode toggle */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex gap-1.5 min-w-0">
                <Button
                  variant={mode === "create" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("create");
                    setSelectedFormula(null);
                  }}
                  className="flex-1 min-w-0 text-xs h-8 overflow-hidden"
                >
                  <Plus className="h-3 w-3 shrink-0 mr-1" />
                  <span className="truncate">{t("createNewFormula")}</span>
                </Button>
                <Button
                  variant={mode === "existing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("existing");
                    setFormulaName("");
                  }}
                  className="flex-1 min-w-0 text-xs h-8 overflow-hidden"
                >
                  <Beaker className="h-3 w-3 shrink-0 mr-1" />
                  <span className="truncate">{t("addToExistingFormula")}</span>
                </Button>
              </div>
            </div>

            {/* Mode-specific content */}
            <div className="px-4 pb-2 shrink-0">
              {mode === "create" ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    {t("formulaName")}
                  </label>
                  <Input
                    placeholder={t("formulaName")}
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* Search input */}
                  <label className="text-[11px] font-medium text-muted-foreground">
                    {t("searchFormulas")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t("searchFormulas")}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedFormula(null);
                      }}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>

                  {/* Selected formula badge */}
                  {selectedFormula && (
                    <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5">
                      <Beaker className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{selectedFormula.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedFormula.ingredient_count} ingredients
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFormula(null)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Formula suggestions / search results */}
                  {!selectedFormula && (
                    <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border p-1">
                      {isLoadingFormulas ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : displayedFormulas.length > 0 ? (
                        displayedFormulas.map((formula) => (
                          <button
                            key={formula.formula_id}
                            onClick={() => setSelectedFormula(formula)}
                            className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors"
                          >
                            <Beaker className="h-3 w-3 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{formula.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {formula.ingredient_count} ingredients · {formula.source}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          {t("noFormulasFound")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider + selected ingredients header */}
            <div className="px-4 py-2 border-t shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {selectedIngredients.length === 1
                    ? t("selectedIngredients", { count: 1 })
                    : t("selectedIngredientsPlural", { count: selectedIngredients.length })}
                </span>
                {selectedIngredients.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {t("clearSelection")}
                  </button>
                )}
              </div>
            </div>

            {/* Selected ingredients list */}
            <ScrollArea className="flex-1 px-4 pb-2">
              <div className="space-y-1">
                {selectedIngredients.map((ing) => (
                  <div
                    key={ing.inci_name}
                    className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{ing.common_name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {ing.inci_name}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveIngredient(ing.inci_name)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {selectedIngredients.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Click + on ingredients to add them
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t shrink-0">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full gap-2 h-9"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                <>
                  {t("goToFormula")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Star, Loader2, Save, Plus, Minus } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Slider } from "@/app/[locale]/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  bulkUpdateVariations,
  setMainVariation,
} from "@/actions/variations";
import type { VariationWithSubstances, ComparisonData } from "@/actions/variations";
import { ColumnToggle } from "./ColumnToggle";
import { useColumnVisibility } from "@/lib/hooks/useColumnVisibility";

interface ComparisonTableProps {
  data: ComparisonData;
  onDataChange?: () => void;
}

type ConcentrationUpdate = {
  formulaId: number;
  substanceId: number;
  concentration: number;
};

export function ComparisonTable({ data, onDataChange }: ComparisonTableProps) {
  // Use persisted column visibility preferences
  const { visibleIds: visibleVariations, toggleVisibility: toggleVariation } =
    useColumnVisibility(
      data.group.group_id,
      data.variations.map((v) => v.formula_id)
    );

  const [pendingUpdates, setPendingUpdates] = useState<Map<string, ConcentrationUpdate>>(
    new Map()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingMain, setIsSettingMain] = useState<number | null>(null);

  // Build a map for quick lookup: substanceId -> { formulaId -> concentration }
  const concentrationMap = useMemo(() => {
    const map = new Map<number, Map<number, number>>();
    for (const variation of data.variations) {
      for (const substance of variation.substances) {
        if (!map.has(substance.substance_id)) {
          map.set(substance.substance_id, new Map());
        }
        map
          .get(substance.substance_id)!
          .set(variation.formula_id, substance.concentration ?? 0);
      }
    }
    return map;
  }, [data.variations]);

  // Get concentration value (with pending updates applied)
  const getConcentration = (
    substanceId: number,
    formulaId: number
  ): number | null => {
    const key = `${formulaId}-${substanceId}`;
    const pending = pendingUpdates.get(key);
    if (pending) {
      return pending.concentration;
    }
    return concentrationMap.get(substanceId)?.get(formulaId) ?? null;
  };

  // Handle slider change
  const handleConcentrationChange = (
    formulaId: number,
    substanceId: number,
    newValue: number
  ) => {
    const key = `${formulaId}-${substanceId}`;
    setPendingUpdates((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, { formulaId, substanceId, concentration: newValue });
      return newMap;
    });
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (pendingUpdates.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const updates = Array.from(pendingUpdates.values());
      await bulkUpdateVariations(updates);
      toast.success(`Saved ${updates.length} changes`);
      setPendingUpdates(new Map());
      onDataChange?.();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Set main variation
  const handleSetMain = async (formulaId: number) => {
    setIsSettingMain(formulaId);
    try {
      await setMainVariation(formulaId);
      toast.success("Main variation updated");
      onDataChange?.();
    } catch (error) {
      console.error("Error setting main variation:", error);
      toast.error("Failed to set main variation");
    } finally {
      setIsSettingMain(null);
    }
  };

  // Get visible variations
  const visibleVariationsList = data.variations.filter((v) =>
    visibleVariations.has(v.formula_id)
  );

  // Calculate max concentration for slider range
  const getMaxConcentration = (substanceId: number): number => {
    let max = 0;
    for (const variation of data.variations) {
      const substance = variation.substances.find(
        (s) => s.substance_id === substanceId
      );
      if (substance?.concentration) {
        max = Math.max(max, substance.concentration);
      }
    }
    // Add 50% headroom for adjustments
    return Math.max(max * 1.5, 1);
  };

  // Calculate total for a variation
  const calculateTotal = (variation: VariationWithSubstances): number => {
    return variation.substances.reduce((total, sub) => {
      const concentration = getConcentration(sub.substance_id, variation.formula_id);
      return total + (concentration ?? 0);
    }, 0);
  };

  // Check if a substance is missing from a variation
  const isMissing = (substanceId: number, formulaId: number): boolean => {
    const variation = data.variations.find((v) => v.formula_id === formulaId);
    if (!variation) return true;
    return !variation.substances.some((s) => s.substance_id === substanceId);
  };

  // Check if a substance is unique to this variation
  const isUnique = (substanceId: number, formulaId: number): boolean => {
    const variationsWithSubstance = data.variations.filter((v) =>
      v.substances.some((s) => s.substance_id === substanceId)
    );
    return (
      variationsWithSubstance.length === 1 &&
      variationsWithSubstance[0].formula_id === formulaId
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with column toggle and save button */}
      <div className="flex items-center justify-between">
        <ColumnToggle
          variations={data.variations}
          visibleIds={visibleVariations}
          onToggle={toggleVariation}
        />
        <Button
          onClick={handleSaveAll}
          disabled={isSaving || pendingUpdates.size === 0}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save All Changes
          {pendingUpdates.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingUpdates.size}
            </Badge>
          )}
        </Button>
      </div>

      {/* Comparison table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                Substance
              </TableHead>
              {visibleVariationsList.map((variation) => (
                <TableHead
                  key={variation.formula_id}
                  className="min-w-[200px] text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      {variation.is_main_variation ? (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <button
                          onClick={() => handleSetMain(variation.formula_id)}
                          disabled={isSettingMain !== null}
                          className="hover:text-yellow-400 transition-colors"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <span className="font-medium">
                        {variation.variation_label || variation.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {variation.base_unit}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.allSubstances.map((substance) => {
              const maxValue = getMaxConcentration(substance.substance_id);
              return (
                <TableRow key={substance.substance_id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    <div className="flex flex-col">
                      <span>{substance.common_name}</span>
                      <span className="text-xs text-muted-foreground">
                        FEMA {substance.fema_number}
                      </span>
                    </div>
                  </TableCell>
                  {visibleVariationsList.map((variation) => {
                    const concentration = getConcentration(
                      substance.substance_id,
                      variation.formula_id
                    );
                    const missing = isMissing(
                      substance.substance_id,
                      variation.formula_id
                    );
                    const unique = isUnique(
                      substance.substance_id,
                      variation.formula_id
                    );

                    return (
                      <TableCell
                        key={variation.formula_id}
                        className={cn(
                          "text-center",
                          missing && "bg-red-50 dark:bg-red-950/20",
                          unique && "bg-green-50 dark:bg-green-950/20"
                        )}
                      >
                        {missing ? (
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Minus className="h-3 w-3" />
                            <span className="text-xs">empty</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 px-2">
                            <div className="flex items-center gap-2 w-full">
                              <Slider
                                value={[concentration ?? 0]}
                                onValueChange={(values) =>
                                  handleConcentrationChange(
                                    variation.formula_id,
                                    substance.substance_id,
                                    values[0]
                                  )
                                }
                                max={maxValue}
                                step={maxValue / 100}
                                className="flex-1"
                              />
                              <span className="text-sm font-mono w-16 text-right">
                                {(concentration ?? 0).toFixed(2)}
                              </span>
                            </div>
                            {unique && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-100 dark:bg-green-900"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                unique
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {/* Total row */}
            <TableRow className="bg-muted/50 font-medium">
              <TableCell className="sticky left-0 bg-muted/50 z-10">
                TOTAL
              </TableCell>
              {visibleVariationsList.map((variation) => (
                <TableCell key={variation.formula_id} className="text-center">
                  <span className="font-mono">
                    {calculateTotal(variation).toFixed(2)}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

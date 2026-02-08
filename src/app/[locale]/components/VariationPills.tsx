"use client";

import { useState, useEffect } from "react";
import { Star, GitCompare, Pencil } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { cn } from "@/lib/utils";
import { getVariationsForFormula } from "@/actions/variations";
import type { FormulaVariation, VariationGroup } from "@/actions/variations";
import { CreateVariationDialog } from "./CreateVariationDialog";
import { EditVariationDialog } from "./EditVariationDialog";
import Link from "next/link";
import { useLocale } from "next-intl";

interface VariationPillsProps {
  formulaId: number;
}

export function VariationPills({ formulaId }: VariationPillsProps) {
  const locale = useLocale();
  const [variations, setVariations] = useState<FormulaVariation[]>([]);
  const [group, setGroup] = useState<VariationGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadVariations = async () => {
    setIsLoading(true);
    try {
      const data = await getVariationsForFormula(formulaId);
      if (data) {
        setVariations(data.variations);
        setGroup(data.group);
      } else {
        setVariations([]);
        setGroup(null);
      }
    } catch (error) {
      console.error("Error loading variations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVariations();
  }, [formulaId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-20 bg-muted animate-pulse rounded-full" />
        <div className="h-7 w-16 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  // No variations yet - show create button only
  if (variations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Variations:</span>
        <CreateVariationDialog
          sourceFormulaId={formulaId}
          onVariationCreated={loadVariations}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Variations:</span>
      {/* Variation pills as links with edit buttons */}
      {variations.map((variation) => (
        <div key={variation.formula_id} className="flex items-center gap-1 group">
          <Link
            href={`/${locale}/formulas/${variation.formula_id}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors",
              "border hover:bg-accent",
              variation.formula_id === formulaId
                ? "bg-primary text-primary-foreground border-primary pointer-events-none"
                : "bg-background border-border"
            )}
          >
            {variation.is_main_variation && (
              <Star className="h-3 w-3 fill-current" />
            )}
            <span>{variation.variation_label || variation.name}</span>
          </Link>
          <EditVariationDialog
            variation={variation}
            onVariationUpdated={loadVariations}
            trigger={
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                title="Edit variation"
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            }
          />
        </div>
      ))}

      {/* Add variation button */}
      <CreateVariationDialog
        sourceFormulaId={formulaId}
        onVariationCreated={loadVariations}
      />

      {/* Compare button - only show if there are multiple variations */}
      {variations.length > 1 && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/formulas/${formulaId}/compare`}>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Link>
        </Button>
      )}
    </div>
  );
}

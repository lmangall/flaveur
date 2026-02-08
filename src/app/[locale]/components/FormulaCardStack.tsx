"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { MoreHorizontal, Layers, Share2, Users, Star, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormulaWithAccess } from "@/actions/formulas";
import type { FormulaGroup } from "@/lib/groupFormulas";

// Source Badge Component - only show for shared/workspace, not for own
function SourceBadge({ formula }: { formula: FormulaWithAccess }) {
  switch (formula.access_source) {
    case "own":
      return null;
    case "shared":
      return (
        <Badge variant="outline" className="text-[10px] gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
          <Share2 className="h-3 w-3" />
          {formula.shared_by_username || "Shared"}
        </Badge>
      );
    case "workspace":
      return (
        <Badge variant="outline" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          <Users className="h-3 w-3" />
          {formula.workspace_name || "Workspace"}
        </Badge>
      );
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "published":
      return "outline" as const;
    case "draft":
      return "warning" as const;
    case "archived":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

export type FormulaCardTranslations = {
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

type FormulaCardStackProps = {
  group: FormulaGroup;
  translations: FormulaCardTranslations;
  onDuplicate: (formulaId: number) => void;
  onDelete: (formula: FormulaWithAccess) => void;
};

export function FormulaCardStack({ group, translations, onDuplicate, onDelete }: FormulaCardStackProps) {
  const router = useRouter();
  const hasVariations = group.variationCount > 1;
  const formula = group.mainFormula;
  const projectType = formula.project_type || "flavor";
  const isPerfume = projectType === "perfume";

  return (
    <Card
      hover
      glow
      className={cn(
        "w-full",
        isPerfume
          ? "border-l-4 border-l-violet-400 dark:border-l-violet-600"
          : "border-l-4 border-l-amber-400 dark:border-l-amber-600"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            <Link href={`/formulas/${formula.formula_id}`} className="hover:underline">
              {formula.name}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/formulas/${formula.formula_id}`)}>
                {translations.view}
              </DropdownMenuItem>
              {formula.can_edit && (
                <DropdownMenuItem onClick={() => router.push(`/formulas/${formula.formula_id}/edit`)}>
                  {translations.edit}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(formula.formula_id)}>
                {translations.duplicate}
              </DropdownMenuItem>
              {formula.access_source === "own" && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(formula)}
                >
                  {translations.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <SourceBadge formula={formula} />
          <span className="text-xs text-muted-foreground">v{formula.version}</span>
          {formula.variation_label && (
            <Badge variant="secondary" className="text-xs">
              {formula.variation_label}
            </Badge>
          )}
          {/* Variations dropdown */}
          {hasVariations && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs gap-1">
                  <Layers className="h-3 w-3" />
                  {group.variationCount}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {group.variations.map((variation) => (
                  <DropdownMenuItem
                    key={variation.formula_id}
                    onClick={() => router.push(`/formulas/${variation.formula_id}`)}
                    className="flex items-center gap-2"
                  >
                    {variation.is_main_variation && <Star className="h-3 w-3 text-yellow-500" />}
                    <span className="flex-1">{variation.variation_label || variation.name}</span>
                    <span className="text-xs text-muted-foreground">v{variation.version}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/formulas/${formula.formula_id}/compare`)}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="h-3 w-3" />
                  Compare all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{formula.description || translations.noDescription}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusBadgeVariant(formula.status || "draft")}>
              {(formula.status || "draft").charAt(0).toUpperCase() + (formula.status || "draft").slice(1)}
            </Badge>
            <Badge variant="outline">{formula.is_public ? translations.public : translations.private}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

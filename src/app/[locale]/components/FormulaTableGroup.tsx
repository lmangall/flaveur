"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { TableCell, TableRow } from "@/app/[locale]/components/ui/table";
import { MoreHorizontal, ChevronDown, ChevronRight, Share2, Users } from "lucide-react";
import type { FormulaWithAccess } from "@/actions/formulas";
import type { FormulaGroup } from "@/lib/groupFormulas";
import type { FormulaCardTranslations } from "./FormulaCardStack";

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

type FormulaTableGroupProps = {
  group: FormulaGroup;
  translations: FormulaCardTranslations;
  onDuplicate: (formulaId: number) => void;
  onDelete: (formula: FormulaWithAccess) => void;
};

// Single row for a formula
function FormulaTableRow({
  formula,
  translations,
  onDuplicate,
  onDelete,
  isVariation = false,
  isLast = false,
}: {
  formula: FormulaWithAccess;
  translations: FormulaCardTranslations;
  onDuplicate: (formulaId: number) => void;
  onDelete: (formula: FormulaWithAccess) => void;
  isVariation?: boolean;
  isLast?: boolean;
}) {
  const router = useRouter();

  return (
    <TableRow className={isVariation ? "bg-muted/30" : ""}>
      <TableCell className={isVariation ? "relative pl-8" : ""}>
        {isVariation && (
          <>
            {/* Tree connector lines */}
            <div
              className="absolute left-4 top-0 w-px bg-border"
              style={{ height: isLast ? "50%" : "100%" }}
            />
            <div className="absolute left-4 top-1/2 w-3 h-px bg-border" />
          </>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/formulas/${formula.formula_id}`} className="font-medium hover:underline">
            {formula.name}
          </Link>
          {isVariation && formula.variation_label && (
            <Badge variant="secondary" className="text-xs">
              {formula.variation_label}
            </Badge>
          )}
        </div>
        {formula.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{formula.description}</p>
        )}
      </TableCell>
      <TableCell>
        <SourceBadge formula={formula} />
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(formula.status || "draft")}>
          {(formula.status || "draft").charAt(0).toUpperCase() + (formula.status || "draft").slice(1)}
        </Badge>
      </TableCell>
      <TableCell>v{formula.version}</TableCell>
      <TableCell className="text-right">
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
                onClick={() => onDelete( formula)}
              >
                {translations.delete}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function FormulaTableGroup({ group, translations, onDuplicate, onDelete }: FormulaTableGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const hasVariations = group.variationCount > 1;
  const otherVariations = group.variations.filter((v) => v.formula_id !== group.mainFormula.formula_id);

  if (!hasVariations) {
    // Single formula, no expansion needed
    return (
      <FormulaTableRow
        formula={group.mainFormula}
        translations={translations}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }

  return (
    <>
      {/* Main row with expand toggle */}
      <TableRow className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Link
              href={`/formulas/${group.mainFormula.formula_id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {group.mainFormula.name}
            </Link>
            {group.mainFormula.variation_label && (
              <Badge variant="secondary" className="text-xs">
                {group.mainFormula.variation_label}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1">
              +{group.variationCount - 1} variation{group.variationCount > 2 ? "s" : ""}
            </Badge>
          </div>
          {group.mainFormula.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px] ml-8">
              {group.mainFormula.description}
            </p>
          )}
        </TableCell>
        <TableCell>
          <SourceBadge formula={group.mainFormula} />
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(group.mainFormula.status || "draft")}>
            {(group.mainFormula.status || "draft").charAt(0).toUpperCase() +
              (group.mainFormula.status || "draft").slice(1)}
          </Badge>
        </TableCell>
        <TableCell>v{group.mainFormula.version}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/formulas/${group.mainFormula.formula_id}`)}>
                {translations.view}
              </DropdownMenuItem>
              {group.mainFormula.can_edit && (
                <DropdownMenuItem
                  onClick={() => router.push(`/formulas/${group.mainFormula.formula_id}/edit`)}
                >
                  {translations.edit}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(group.mainFormula.formula_id)}>
                {translations.duplicate}
              </DropdownMenuItem>
              {group.mainFormula.access_source === "own" && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(group.mainFormula)}
                >
                  {translations.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Expanded variation rows */}
      {isExpanded &&
        otherVariations.map((variation, index) => (
          <FormulaTableRow
            key={variation.formula_id}
            formula={variation}
            translations={translations}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            isVariation
            isLast={index === otherVariations.length - 1}
          />
        ))}
    </>
  );
}

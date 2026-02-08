"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/app/[locale]/components/ui/table";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Package,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { ConcentrationUnitValue } from "@/constants/formula";

export interface CompoundIngredient {
  ingredient_formula_id: number;
  concentration: number;
  unit: string;
  order_index: number;
  ingredient: {
    formula_id: number;
    name: string;
    description: string | null;
    base_unit: string;
    status: string;
    version: number;
    substance_count: number;
  };
}

export interface NestedSubstance {
  substance_id: number;
  common_name: string;
  fema_number: number | null;
  concentration: number;
  unit: string;
}

interface CompoundRowProps {
  compound: CompoundIngredient;
  nestedSubstances?: NestedSubstance[];
  visibleColumns: Record<string, boolean>;
  isOwner: boolean;
  onEdit?: (compound: CompoundIngredient) => void;
  onRemove?: (ingredientFormulaId: number) => void;
  onConcentrationSave?: (
    ingredientFormulaId: number,
    concentration: number,
    unit: string
  ) => void;
  translations: {
    compound: string;
    ingredients: string;
    edit: string;
    delete: string;
    actions: string;
    viewFormula: string;
    save: string;
    cancel: string;
    calculatedConcentration: string;
  };
}

export function CompoundRow({
  compound,
  nestedSubstances = [],
  visibleColumns,
  isOwner,
  onRemove,
  onConcentrationSave,
  translations,
}: CompoundRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editConcentration, setEditConcentration] = useState(
    String(compound.concentration)
  );
  const [editUnit, setEditUnit] = useState(compound.unit);
  const locale = useLocale();

  const handleSave = () => {
    const concentration = parseFloat(editConcentration);
    if (!isNaN(concentration) && concentration > 0) {
      onConcentrationSave?.(
        compound.ingredient_formula_id,
        concentration,
        editUnit
      );
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditConcentration(String(compound.concentration));
    setEditUnit(compound.unit);
    setIsEditing(false);
  };

  // Count visible columns for colspan
  const visibleColumnCount =
    Object.values(visibleColumns).filter(Boolean).length + (isOwner ? 1 : 0);

  return (
    <>
      {/* Main compound row */}
      <TableRow className="bg-blue-50/30 hover:bg-blue-50/50">
        {visibleColumns.fema_number && (
          <TableCell>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </TableCell>
        )}
        {visibleColumns.common_name && (
          <TableCell>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary shrink-0" />
              <Link
                href={`/${locale}/formulas/${compound.ingredient.formula_id}`}
                className="font-medium text-primary hover:underline"
              >
                {compound.ingredient.name}
              </Link>
              <Badge variant="secondary" className="text-xs">
                {translations.compound}
              </Badge>
            </div>
            {compound.ingredient.description && (
              <p className="text-xs text-muted-foreground mt-1 pl-6 truncate max-w-xs">
                {compound.ingredient.description}
              </p>
            )}
          </TableCell>
        )}
        {visibleColumns.phase && <TableCell>—</TableCell>}
        {visibleColumns.pyramid_position && <TableCell>—</TableCell>}
        {visibleColumns.concentration && (
          <TableCell>
            {isEditing ? (
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
                {compound.concentration} {compound.unit}
              </>
            )}
          </TableCell>
        )}
        {visibleColumns.inci_name && <TableCell>—</TableCell>}
        {visibleColumns.cosmetic_role && <TableCell>—</TableCell>}
        {visibleColumns.is_natural && <TableCell>—</TableCell>}
        {visibleColumns.odor && <TableCell className="max-w-[120px]">—</TableCell>}
        {visibleColumns.olfactory_taste_notes && <TableCell className="max-w-[120px]">—</TableCell>}
        {visibleColumns.functional_groups && <TableCell className="max-w-[120px]">—</TableCell>}
        {visibleColumns.flavor_profile && <TableCell className="max-w-[150px]">—</TableCell>}
        {visibleColumns.cas_number && <TableCell>—</TableCell>}
        {visibleColumns.supplier && <TableCell>—</TableCell>}
        {visibleColumns.dilution && <TableCell>—</TableCell>}
        {visibleColumns.price_per_kg && <TableCell>—</TableCell>}
        {isOwner && (
          <TableCell className="text-right">
            {isEditing ? (
              <div className="flex gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  title={translations.save}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  title={translations.cancel}
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
                  <DropdownMenuLabel>{translations.actions}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    {translations.edit}
                  </button>
                  <Link
                    href={`/${locale}/formulas/${compound.ingredient.formula_id}`}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {translations.viewFormula}
                  </Link>
                  <DropdownMenuSeparator />
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer text-destructive"
                    onClick={() => onRemove?.(compound.ingredient_formula_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {translations.delete}
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TableCell>
        )}
      </TableRow>

      {/* Expanded nested substances */}
      {isExpanded && (
        <TableRow className="bg-blue-50/20">
          <TableCell colSpan={visibleColumnCount} className="py-2 px-4">
            <div className="pl-6 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {translations.ingredients} ({compound.ingredient.substance_count})
              </div>
              {nestedSubstances.length > 0 ? (
                <div className="space-y-1">
                  {nestedSubstances.map((sub) => {
                    // Calculate contribution: if compound is 100 g/kg and substance is 50 g/kg in the compound,
                    // then contribution is (100/1000) * 50 = 5 g/kg
                    const multiplier = compound.concentration / 1000;
                    const contribution = sub.concentration * multiplier;

                    return (
                      <div
                        key={sub.substance_id}
                        className="flex items-center gap-4 text-sm py-1 px-2 rounded hover:bg-muted/50"
                      >
                        <span className="text-muted-foreground w-16">
                          {sub.fema_number ? `#${sub.fema_number}` : "—"}
                        </span>
                        <span className="flex-1">{sub.common_name}</span>
                        <span className="text-muted-foreground text-xs">
                          {sub.concentration} {sub.unit}
                        </span>
                        <span
                          className="text-xs text-primary"
                          title={translations.calculatedConcentration}
                        >
                          → {contribution.toFixed(2)} {sub.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {compound.ingredient.substance_count} substances (expand to load)
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

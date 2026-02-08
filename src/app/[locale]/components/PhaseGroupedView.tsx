"use client";

import { useMemo, useState, useEffect } from "react";
import { Card } from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/[locale]/components/ui/collapsible";
import { useTranslations } from "next-intl";
import { updateSubstancePhase } from "@/actions/formulas";
import { toast } from "sonner";
import {
  COSMETIC_PHASE_OPTIONS,
  COSMETIC_PHASE_COLORS,
  PRODUCT_TYPE_PHASES,
  type CosmeticPhaseValue,
  type CosmeticProductTypeValue,
} from "@/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";

interface SubstanceRow {
  substance_id: number;
  common_name?: string;
  concentration?: number;
  unit?: string;
  phase?: string | null;
  cosmetic_role?: string[] | null;
  inci_name?: string | null;
  hlb_value?: number | null;
  hlb_required?: number | null;
}

interface PhaseGroupedViewProps {
  substances: SubstanceRow[];
  formulaId: number;
  cosmeticProductType: string | null;
  isOwner: boolean;
  onSubstanceClick?: (substanceId: number) => void;
}

export function PhaseGroupedView({
  substances,
  formulaId,
  cosmeticProductType,
  isOwner,
  onSubstanceClick,
}: PhaseGroupedViewProps) {
  const t = useTranslations("Cosmetics");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [localSubstances, setLocalSubstances] = useState<SubstanceRow[]>(substances);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // Sync with props when substances change from parent
  useEffect(() => {
    setLocalSubstances(substances);
  }, [substances]);

  // Get relevant phases for this product type
  const relevantPhases = useMemo(() => {
    if (!cosmeticProductType) return COSMETIC_PHASE_OPTIONS.map((p) => p.value);
    return (
      PRODUCT_TYPE_PHASES[cosmeticProductType as CosmeticProductTypeValue] ??
      COSMETIC_PHASE_OPTIONS.map((p) => p.value)
    );
  }, [cosmeticProductType]);

  // Group substances by phase - use localSubstances for optimistic updates
  const grouped = useMemo(() => {
    const groups: Record<string, SubstanceRow[]> = {};
    const unassigned: SubstanceRow[] = [];

    for (const phase of relevantPhases) {
      groups[phase] = [];
    }

    for (const sub of localSubstances) {
      const phase = sub.phase as CosmeticPhaseValue | null;
      if (phase && groups[phase]) {
        groups[phase].push(sub);
      } else {
        unassigned.push(sub);
      }
    }

    return { groups, unassigned };
  }, [localSubstances, relevantPhases]);

  // Phase guidance translation keys
  const phaseGuidanceKey: Record<string, string> = {
    water: "waterPhaseGuidance",
    oil: "oilPhaseGuidance",
    cool_down: "coolDownPhaseGuidance",
    surfactant: "surfactantPhaseGuidance",
    dry: "dryPhaseGuidance",
  };

  const handlePhaseChange = async (
    substanceId: number,
    newPhase: string | null
  ) => {
    try {
      await updateSubstancePhase(
        formulaId,
        substanceId,
        newPhase === "unassigned" ? null : newPhase
      );
    } catch {
      toast.error("Failed to update phase");
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPhaseTotal = (subs: SubstanceRow[]) => {
    return subs.reduce((sum, s) => sum + (s.concentration ?? 0), 0);
  };

  const renderSubstanceTable = (
    subs: SubstanceRow[],
    phaseKey: string | null
  ) => {
    if (subs.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-3 px-4">
          {t("noIngredientsInPhase")}
        </p>
      );
    }

    return (
      <div className="divide-y">
        {subs.map((sub) => (
          <div
            key={sub.substance_id}
            className="flex items-center justify-between gap-3 py-2.5 px-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onSubstanceClick?.(sub.substance_id)}
                className="text-sm font-medium hover:underline truncate block text-left"
              >
                {sub.common_name || `#${sub.substance_id}`}
              </button>
              {sub.inci_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {sub.inci_name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {sub.cosmetic_role &&
                sub.cosmetic_role.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {sub.cosmetic_role.slice(0, 3).map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {sub.cosmetic_role.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{sub.cosmetic_role.length - 3}
                      </span>
                    )}
                  </div>
                )}

              {sub.hlb_value != null && sub.cosmetic_role?.includes("emulsifier") && (
                <Badge variant="secondary" className="text-xs font-mono hidden sm:inline-flex">
                  HLB {sub.hlb_value.toFixed(1)}
                </Badge>
              )}
              {sub.hlb_required != null && sub.phase === "oil" && !sub.cosmetic_role?.includes("emulsifier") && (
                <Badge variant="secondary" className="text-xs font-mono hidden sm:inline-flex">
                  req. {sub.hlb_required.toFixed(1)}
                </Badge>
              )}

              <span className="text-sm font-mono w-20 text-right">
                {sub.concentration != null
                  ? `${sub.concentration}${sub.unit ? ` ${sub.unit}` : ""}`
                  : "—"}
              </span>

              {isOwner && (
                <Select
                  value={sub.phase ?? "unassigned"}
                  onValueChange={(val) =>
                    handlePhaseChange(sub.substance_id, val)
                  }
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      {t("unassigned")}
                    </SelectItem>
                    {COSMETIC_PHASE_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {t(p.value === "cool_down" ? "coolDownPhase" : `${p.value}Phase`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-3">
      {relevantPhases.map((phase) => {
        const colors =
          COSMETIC_PHASE_COLORS[phase as CosmeticPhaseValue];
        const subs = grouped.groups[phase] || [];
        const total = getPhaseTotal(subs);
        const isOpen = openSections[phase] !== false; // default open

        const phaseLabel =
          phase === "water"
            ? t("waterPhase")
            : phase === "oil"
              ? t("oilPhase")
              : phase === "cool_down"
                ? t("coolDownPhase")
                : phase === "surfactant"
                  ? t("surfactantPhase")
                  : t("dryPhase");

        return (
          <Card
            key={phase}
            className={cn("overflow-hidden border-l-4", colors?.border)}
          >
            <Collapsible open={isOpen} onOpenChange={() => toggleSection(phase)}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors",
                    colors?.bg
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        colors?.dot
                      )}
                    />
                    <span className={cn("font-medium text-sm", colors?.text)}>
                      {phaseLabel}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-left">
                        <p className="text-xs">{t(phaseGuidanceKey[phase])}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Badge variant="outline" className="text-xs">
                      {subs.length} {subs.length === 1 ? t("ingredient") : t("ingredients")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {t("phaseTotal")}: {total.toFixed(2)}%
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {renderSubstanceTable(subs, phase)}
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

    </div>
    </TooltipProvider>
  );
}

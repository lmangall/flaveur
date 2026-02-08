"use client";

import { useMemo } from "react";
import { Card } from "@/app/[locale]/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface SubstanceData {
  substance_id: number;
  common_name?: string;
  concentration?: number;
  phase?: string | null;
  cosmetic_role?: string[] | null;
  hlb_value?: number | null;
  hlb_required?: number | null;
}

interface HlbCalculatorProps {
  substances: SubstanceData[];
}

export function HlbCalculator({ substances }: HlbCalculatorProps) {
  const t = useTranslations("Cosmetics");

  const analysis = useMemo(() => {
    // Oils: substances in oil phase with hlb_required
    const oils = substances.filter(
      (s) =>
        s.phase === "oil" &&
        s.hlb_required != null &&
        s.concentration != null &&
        !s.cosmetic_role?.includes("emulsifier")
    );

    // Emulsifiers: substances with role "emulsifier" and hlb_value
    const emulsifiers = substances.filter(
      (s) =>
        s.cosmetic_role?.includes("emulsifier") &&
        s.hlb_value != null &&
        s.concentration != null
    );

    // Calculate required HLB (weighted average by oil concentration)
    const totalOilConc = oils.reduce(
      (sum, s) => sum + (s.concentration ?? 0),
      0
    );
    const requiredHlb =
      totalOilConc > 0
        ? oils.reduce(
            (sum, s) =>
              sum + (s.concentration ?? 0) * (s.hlb_required ?? 0),
            0
          ) / totalOilConc
        : null;

    // Calculate actual HLB (weighted average by emulsifier concentration)
    const totalEmulsifierConc = emulsifiers.reduce(
      (sum, s) => sum + (s.concentration ?? 0),
      0
    );
    const actualHlb =
      totalEmulsifierConc > 0
        ? emulsifiers.reduce(
            (sum, s) =>
              sum + (s.concentration ?? 0) * (s.hlb_value ?? 0),
            0
          ) / totalEmulsifierConc
        : null;

    // Determine balance status
    let status: "balanced" | "warning" | "unbalanced" | "incomplete" =
      "incomplete";
    let diff = 0;

    if (requiredHlb != null && actualHlb != null) {
      diff = Math.abs(requiredHlb - actualHlb);
      if (diff <= 1) status = "balanced";
      else if (diff <= 2) status = "warning";
      else status = "unbalanced";
    }

    return {
      oils,
      emulsifiers,
      requiredHlb,
      actualHlb,
      status,
      diff,
    };
  }, [substances]);

  // Don't render if no data to show
  if (
    analysis.oils.length === 0 &&
    analysis.emulsifiers.length === 0
  ) {
    return null;
  }

  const gaugeMin = 0;
  const gaugeMax = 20;
  const gaugeRange = gaugeMax - gaugeMin;

  const getGaugePosition = (value: number | null) => {
    if (value == null) return 0;
    return Math.max(0, Math.min(100, ((value - gaugeMin) / gaugeRange) * 100));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("hlbBalance")}</h3>
        {analysis.status === "balanced" && (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hlbBalanced")}</span>
          </div>
        )}
        {(analysis.status === "warning" ||
          analysis.status === "unbalanced") && (
          <div
            className={cn(
              "flex items-center gap-1.5",
              analysis.status === "warning"
                ? "text-yellow-600"
                : "text-red-600"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{t("hlbUnbalanced")}</span>
          </div>
        )}
      </div>

      {/* Gauge */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{gaugeMin}</span>
          <span>HLB Scale</span>
          <span>{gaugeMax}</span>
        </div>
        <div className="relative h-6 bg-muted rounded-full overflow-hidden">
          {/* Actual HLB bar */}
          {analysis.actualHlb != null && (
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all",
                analysis.status === "balanced"
                  ? "bg-emerald-400"
                  : analysis.status === "warning"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              )}
              style={{
                width: `${getGaugePosition(analysis.actualHlb)}%`,
              }}
            />
          )}

          {/* Required HLB marker */}
          {analysis.requiredHlb != null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/80 z-10"
                    style={{
                      left: `${getGaugePosition(analysis.requiredHlb)}%`,
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-foreground rounded-full" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {t("requiredHlb")}: {analysis.requiredHlb.toFixed(1)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-between mt-2 text-xs">
          {analysis.requiredHlb != null && (
            <span className="text-muted-foreground">
              {t("requiredHlb")}:{" "}
              <span className="font-mono font-medium text-foreground">
                {analysis.requiredHlb.toFixed(1)}
              </span>
            </span>
          )}
          {analysis.actualHlb != null && (
            <span className="text-muted-foreground">
              {t("actualHlb")}:{" "}
              <span className="font-mono font-medium text-foreground">
                {analysis.actualHlb.toFixed(1)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        {analysis.oils.length > 0 && (
          <div>
            <h4 className="font-medium text-muted-foreground mb-2">
              Oils ({t("requiredHlb")})
            </h4>
            <div className="space-y-1">
              {analysis.oils.map((oil) => (
                <div
                  key={oil.substance_id}
                  className="flex justify-between"
                >
                  <span className="truncate">
                    {oil.common_name || `#${oil.substance_id}`}
                    <span className="text-muted-foreground ml-1">
                      ({oil.concentration}%)
                    </span>
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0 ml-2">
                    HLB {oil.hlb_required?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.emulsifiers.length > 0 && (
          <div>
            <h4 className="font-medium text-muted-foreground mb-2">
              Emulsifiers ({t("hlbValue")})
            </h4>
            <div className="space-y-1">
              {analysis.emulsifiers.map((em) => (
                <div
                  key={em.substance_id}
                  className="flex justify-between"
                >
                  <span className="truncate">
                    {em.common_name || `#${em.substance_id}`}
                    <span className="text-muted-foreground ml-1">
                      ({em.concentration}%)
                    </span>
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0 ml-2">
                    HLB {em.hlb_value?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

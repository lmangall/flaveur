"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";

interface PyramidSubstance {
  substance_id: number;
  common_name: string;
  pyramid_position: "top" | "heart" | "base" | null;
  concentration: number;
  unit: string;
}

interface OlfactivePyramidProps {
  substances: PyramidSubstance[];
  className?: string;
}

interface TierData {
  label: string;
  sublabel: string;
  substances: PyramidSubstance[];
  totalConcentration: number;
  percentage: number;
  gradient: string;
  textColor: string;
  accentColor: string;
  glowColor: string;
  icon: string;
}

const TIER_CONFIG = {
  top: {
    label: "Top Notes",
    sublabel: "First impression",
    gradient: "from-sky-100/80 via-cyan-50/60 to-teal-50/40",
    textColor: "text-sky-800",
    accentColor: "bg-sky-500",
    glowColor: "shadow-sky-200/50",
    icon: "✧",
  },
  heart: {
    label: "Heart Notes",
    sublabel: "The soul",
    gradient: "from-rose-100/80 via-pink-50/60 to-fuchsia-50/40",
    textColor: "text-rose-800",
    accentColor: "bg-rose-500",
    glowColor: "shadow-rose-200/50",
    icon: "❦",
  },
  base: {
    label: "Base Notes",
    sublabel: "Foundation",
    gradient: "from-amber-100/80 via-orange-50/60 to-yellow-50/40",
    textColor: "text-amber-800",
    accentColor: "bg-amber-600",
    glowColor: "shadow-amber-200/50",
    icon: "◈",
  },
} as const;

function getBalanceWarnings(tiers: Record<string, TierData>): string[] {
  const warnings: string[] = [];
  const top = tiers.top?.percentage || 0;
  const heart = tiers.heart?.percentage || 0;
  const base = tiers.base?.percentage || 0;
  const total = top + heart + base;

  if (total === 0) return [];

  if (top > 40) warnings.push("Top-heavy composition — consider reducing top notes for better longevity");
  if (base < 10 && total > 0)
    warnings.push("Light on fixatives — add base notes for improved sillage");
  if (heart < 20 && total > 0)
    warnings.push("Thin heart accord — strengthen middle notes for depth");
  if (top === 0) warnings.push("Missing top notes — opening will lack initial sparkle");

  return warnings;
}

export function OlfactivePyramid({
  substances,
  className,
}: OlfactivePyramidProps) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const { tiers, warnings } = useMemo(() => {
    const tierMap: Record<string, PyramidSubstance[]> = {
      top: [],
      heart: [],
      base: [],
    };

    // Only include substances with a manual pyramid_position
    for (const s of substances) {
      if (s.pyramid_position && tierMap[s.pyramid_position]) {
        tierMap[s.pyramid_position].push(s);
      }
    }

    const classifiedTotal = Object.values(tierMap)
      .flat()
      .reduce((sum, s) => sum + (s.concentration || 0), 0);

    const tiers: Record<string, TierData> = {};
    for (const [key, config] of Object.entries(TIER_CONFIG)) {
      const subs = tierMap[key];
      const tierTotal = subs.reduce(
        (sum, s) => sum + (s.concentration || 0),
        0
      );
      tiers[key] = {
        label: config.label,
        sublabel: config.sublabel,
        substances: subs,
        totalConcentration: tierTotal,
        percentage: classifiedTotal > 0 ? (tierTotal / classifiedTotal) * 100 : 0,
        gradient: config.gradient,
        textColor: config.textColor,
        accentColor: config.accentColor,
        glowColor: config.glowColor,
        icon: config.icon,
      };
    }

    return {
      tiers,
      warnings: getBalanceWarnings(tiers),
    };
  }, [substances]);

  // Count substances with manual pyramid positions
  const classifiedCount = substances.filter(
    (s) => s.pyramid_position !== null
  ).length;

  if (classifiedCount === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50" />
          <div className="absolute inset-2 bg-gradient-to-br from-white to-gray-50 rounded-full flex items-center justify-center">
            <span className="text-3xl opacity-30">◇</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          No pyramid positions assigned
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px] mx-auto">
          Assign substances to Top, Heart, or Base notes using the Pyramid column to visualize the olfactive pyramid
        </p>
      </div>
    );
  }

  const tierOrder = ["top", "heart", "base"] as const;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("space-y-6", className)}>
        {/* Pyramid Visualization */}
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-sky-100/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-gradient-radial from-rose-100/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-radial from-amber-100/20 to-transparent rounded-full blur-2xl" />
          </div>

          {/* Pyramid Tiers */}
          <div className="relative flex flex-col items-center gap-1 py-4">
            {tierOrder.map((tierKey, index) => {
              const tier = tiers[tierKey];
              const isHovered = hoveredTier === tierKey;
              const hasSubstances = tier.substances.length > 0;

              // Calculate tier widths for pyramid shape
              const widthPercent = 40 + (index * 25); // top: 40%, heart: 65%, base: 90%

              return (
                <div
                  key={tierKey}
                  className="relative w-full flex justify-center"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                  onMouseEnter={() => setHoveredTier(tierKey)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  <div
                    className={cn(
                      "relative transition-all duration-500 ease-out cursor-default",
                      isHovered && hasSubstances ? "scale-[1.02] z-10" : "scale-100",
                    )}
                    style={{ width: `${widthPercent}%` }}
                  >
                    {/* Tier card */}
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl border transition-all duration-500",
                        hasSubstances
                          ? cn(
                              "bg-gradient-to-r backdrop-blur-sm",
                              tier.gradient,
                              isHovered
                                ? `border-current/20 shadow-lg ${tier.glowColor}`
                                : "border-white/40 shadow-sm"
                            )
                          : "bg-gray-50/50 border-gray-100 border-dashed",
                        // Pyramid shape clip-path
                        index === 0 && "rounded-t-2xl",
                        index === 2 && "rounded-b-2xl"
                      )}
                    >
                      {/* Shimmer effect on hover */}
                      {isHovered && hasSubstances && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out]" />
                      )}

                      <div className="relative p-3 sm:p-4">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-lg opacity-60 transition-transform duration-300",
                              isHovered && "scale-110"
                            )}>
                              {TIER_CONFIG[tierKey].icon}
                            </span>
                            <div>
                              <h4 className={cn(
                                "text-xs sm:text-sm font-semibold tracking-wide",
                                hasSubstances ? tier.textColor : "text-gray-400"
                              )}>
                                {tier.label}
                              </h4>
                              <p className="text-[10px] text-muted-foreground/60 tracking-wide uppercase">
                                {tier.sublabel}
                              </p>
                            </div>
                          </div>

                          {/* Percentage indicator */}
                          {hasSubstances && (
                            <div className="flex items-center gap-2">
                              <div className="relative h-1.5 w-16 bg-black/5 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                                    tier.accentColor
                                  )}
                                  style={{ width: `${tier.percentage}%` }}
                                />
                              </div>
                              <span className={cn(
                                "text-xs font-bold tabular-nums min-w-[2.5rem] text-right",
                                tier.textColor
                              )}>
                                {Math.round(tier.percentage)}%
                              </span>
                            </div>
                          )}

                          {!hasSubstances && (
                            <span className="text-xs text-gray-400 italic">Empty</span>
                          )}
                        </div>

                        {/* Substances */}
                        {hasSubstances && (
                          <div className="flex flex-wrap gap-1.5">
                            {tier.substances
                              .sort((a, b) => (b.concentration || 0) - (a.concentration || 0))
                              .map((s) => (
                                <Tooltip key={s.substance_id}>
                                  <TooltipTrigger asChild>
                                    <span
                                      className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px]",
                                        "bg-white/70 backdrop-blur-sm border border-white/50",
                                        "transition-all duration-200 hover:bg-white hover:shadow-sm",
                                        "cursor-default",
                                        tier.textColor
                                      )}
                                    >
                                      <span className="font-medium">{s.common_name}</span>
                                      <span className="opacity-50 text-[10px]">
                                        {s.concentration}{s.unit}
                                      </span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <span className="font-medium">{s.common_name}</span>
                                    <span className="text-muted-foreground ml-1">
                                      — {s.concentration} {s.unit}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connecting line between tiers */}
                    {index < 2 && hasSubstances && tiers[tierOrder[index + 1]].substances.length > 0 && (
                      <div className="absolute left-1/2 -bottom-1 w-px h-2 bg-gradient-to-b from-current/10 to-transparent" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance warnings */}
        {warnings.length > 0 && (
          <div className="space-y-1.5">
            {warnings.map((w, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 text-xs rounded-lg px-3 py-2.5",
                  "bg-gradient-to-r from-amber-50/80 to-orange-50/40",
                  "border border-amber-200/60 text-amber-800"
                )}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <span className="text-amber-500 mt-0.5 text-[10px]">◆</span>
                <span className="leading-relaxed">{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-300 to-sky-400" />
            <span>Volatile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-rose-400" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
            <span>Fixative</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

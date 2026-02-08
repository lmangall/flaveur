"use client";

import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  OLFACTIVE_FAMILY_COLORS,
  VOLATILITY_TIER_COLORS,
  getPrimaryFamily,
  getSubFamily,
  getVolatilityTier,
} from "@/constants/perfumery";
import { cn } from "@/lib/utils";

interface OlfactiveFamilyBadgeProps {
  family: string | null;
  size?: "sm" | "default";
}

export function OlfactiveFamilyBadge({
  family,
  size = "default",
}: OlfactiveFamilyBadgeProps) {
  if (!family) return null;

  const primary = getPrimaryFamily(family);
  const sub = getSubFamily(family);
  const colors =
    OLFACTIVE_FAMILY_COLORS[primary] ||
    "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colors,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
    >
      {primary}
      {sub && (
        <span className="ml-0.5 opacity-70">/ {sub}</span>
      )}
    </span>
  );
}

interface VolatilityBadgeProps {
  volatilityClass: string | null;
  size?: "sm" | "default";
}

export function VolatilityBadge({
  volatilityClass,
  size = "default",
}: VolatilityBadgeProps) {
  if (!volatilityClass) return null;

  const tier = getVolatilityTier(volatilityClass);
  if (!tier) return null;

  const colors = VOLATILITY_TIER_COLORS[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colors.bg,
        colors.text,
        colors.border,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
    >
      {volatilityClass === "Head"
        ? "Top"
        : volatilityClass === "Head/Heart"
        ? "Top-Heart"
        : volatilityClass === "Heart"
        ? "Heart"
        : volatilityClass === "Heart/Base"
        ? "Heart-Base"
        : "Base"}
    </span>
  );
}

interface DomainBadgeProps {
  domain: string | null;
  size?: "sm" | "default";
}

export function DomainBadge({ domain, size = "default" }: DomainBadgeProps) {
  if (!domain || domain === "flavor") return null;

  const colors =
    domain === "fragrance"
      ? "bg-violet-100 text-violet-700 border-violet-300"
      : "bg-indigo-100 text-indigo-700 border-indigo-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colors,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
    >
      {domain === "fragrance" ? "Fragrance" : "Flavor + Fragrance"}
    </span>
  );
}

interface PriceRangeBadgeProps {
  priceRange: string | null;
  size?: "sm" | "default";
}

export function PriceRangeBadge({
  priceRange,
  size = "default",
}: PriceRangeBadgeProps) {
  if (!priceRange) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
    >
      {priceRange}
    </Badge>
  );
}

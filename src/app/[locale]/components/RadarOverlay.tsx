"use client";

import { useState, useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/[locale]/components/ui/chart";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Eye, EyeOff, Star } from "lucide-react";
import type { VariationWithSubstances } from "@/actions/variations";

interface RadarOverlayProps {
  variations: VariationWithSubstances[];
  visibleIds: Set<number>;
}

// Color palette for variations
const COLORS = [
  "hsl(var(--primary))",
  "hsl(142.1, 76.2%, 36.3%)", // green
  "hsl(24.6, 95%, 53.1%)", // orange
  "hsl(262.1, 83.3%, 57.8%)", // purple
  "hsl(346.8, 77.2%, 49.8%)", // red
  "hsl(199.4, 95.5%, 53.8%)", // blue
];

// Default attributes for flavor profile
const DEFAULT_ATTRIBUTES = ["Sweetness", "Sourness", "Bitterness", "Umami", "Saltiness"];

type FlavorData = {
  attribute: string;
  [key: string]: string | number;
};

export function RadarOverlay({ variations, visibleIds }: RadarOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get visible variations
  const visibleVariations = variations.filter((v) =>
    visibleIds.has(v.formula_id)
  );

  // Check if any variation has flavor profile data
  const hasFlavorProfiles = visibleVariations.some(
    (v) => v.flavor_profile && v.flavor_profile.length > 0
  );

  // Build chart config dynamically based on visible variations
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    visibleVariations.forEach((variation, index) => {
      const key = `var_${variation.formula_id}`;
      config[key] = {
        label: variation.variation_label || variation.name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [visibleVariations]);

  // Build flavor profile data from actual stored profiles
  const flavorData = useMemo(() => {
    // Collect all unique attributes across all variations
    const allAttributes = new Set<string>(DEFAULT_ATTRIBUTES);

    for (const variation of visibleVariations) {
      if (variation.flavor_profile) {
        for (const attr of variation.flavor_profile) {
          allAttributes.add(attr.attribute);
        }
      }
    }

    // Build data for each attribute
    const data: FlavorData[] = [];
    for (const attribute of allAttributes) {
      const item: FlavorData = { attribute };

      for (const variation of visibleVariations) {
        const key = `var_${variation.formula_id}`;
        // Find the attribute value in this variation's flavor profile
        const profileAttr = variation.flavor_profile?.find(
          (p) => p.attribute === attribute
        );
        item[key] = profileAttr?.value ?? 0;
      }

      data.push(item);
    }

    return data;
  }, [visibleVariations]);

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className="w-full"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Flavor Profile Overlay
      </Button>
    );
  }

  // Don't show if no flavor profiles exist
  if (!hasFlavorProfiles) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Flavor Profile Comparison</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No flavor profiles have been set for these variations yet.
            <br />
            Add flavor profiles on each formula&apos;s detail page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Flavor Profile Comparison</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Radar Chart */}
          <div className="flex-1 min-h-[300px]">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RadarChart data={flavorData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="attribute" />
                {visibleVariations.map((variation, index) => (
                  <Radar
                    key={variation.formula_id}
                    name={variation.variation_label || variation.name}
                    dataKey={`var_${variation.formula_id}`}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.2}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fillOpacity: 1 }}
                  />
                ))}
              </RadarChart>
            </ChartContainer>
          </div>

          {/* Legend */}
          <div className="lg:w-48 space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Variations
            </p>
            {visibleVariations.map((variation, index) => (
              <div
                key={variation.formula_id}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex items-center gap-1">
                  {variation.is_main_variation && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                  <span>{variation.variation_label || variation.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

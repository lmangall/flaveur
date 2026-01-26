"use client";

import { Star, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import type { FlavourVariation } from "@/actions/variations";

interface ColumnToggleProps {
  variations: FlavourVariation[];
  visibleIds: Set<number>;
  onToggle: (flavourId: number) => void;
}

export function ColumnToggle({
  variations,
  visibleIds,
  onToggle,
}: ColumnToggleProps) {
  const showAll = () => {
    variations.forEach((v) => {
      if (!visibleIds.has(v.flavour_id)) {
        onToggle(v.flavour_id);
      }
    });
  };

  const hideNonMain = () => {
    variations.forEach((v) => {
      if (!v.is_main_variation && visibleIds.has(v.flavour_id)) {
        onToggle(v.flavour_id);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Show Columns
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Visible Variations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {variations.map((variation) => (
            <DropdownMenuCheckboxItem
              key={variation.flavour_id}
              checked={visibleIds.has(variation.flavour_id)}
              onCheckedChange={() => onToggle(variation.flavour_id)}
              disabled={visibleIds.size === 1 && visibleIds.has(variation.flavour_id)}
            >
              <div className="flex items-center gap-2">
                {variation.is_main_variation && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                )}
                <span>{variation.variation_label || variation.name}</span>
              </div>
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <div className="flex gap-1 p-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={showAll}
            >
              <Eye className="h-3 w-3 mr-1" />
              Show All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={hideNonMain}
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Hide All
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-sm text-muted-foreground">
        {visibleIds.size} of {variations.length} visible
      </span>
    </div>
  );
}

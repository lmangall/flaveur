"use client";

import { FlaskConical, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type IngredientType = "substance" | "compound";

interface IngredientTypeToggleProps {
  value: IngredientType;
  onChange: (type: IngredientType) => void;
  className?: string;
}

export function IngredientTypeToggle({
  value,
  onChange,
  className = "",
}: IngredientTypeToggleProps) {
  return (
    <div className={cn("inline-flex rounded-md border", className)}>
      <button
        type="button"
        onClick={() => onChange("substance")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-l-md",
          value === "substance"
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-muted text-muted-foreground"
        )}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Substance
      </button>
      <button
        type="button"
        onClick={() => onChange("compound")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-r-md border-l",
          value === "compound"
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-muted text-muted-foreground"
        )}
      >
        <Package className="h-3.5 w-3.5" />
        Compound
      </button>
    </div>
  );
}

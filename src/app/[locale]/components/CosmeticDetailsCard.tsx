"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/app/[locale]/components/ui/card";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { useTranslations } from "next-intl";
import { updateCosmeticDetails } from "@/actions/formulas";
import { toast } from "sonner";
import {
  getCosmeticProductTypeLabel,
  getPhColor,
  PH_COLOR_CLASSES,
} from "@/constants";
import { cn } from "@/lib/utils";

interface CosmeticDetailsCardProps {
  formulaId: number;
  cosmeticProductType: string | null;
  targetPh: number | null;
  preservativeSystem: string | null;
  manufacturingNotes: string | null;
  isOwner: boolean;
}

export function CosmeticDetailsCard({
  formulaId,
  cosmeticProductType,
  targetPh,
  preservativeSystem,
  manufacturingNotes,
  isOwner,
}: CosmeticDetailsCardProps) {
  const t = useTranslations("Cosmetics");
  const [ph, setPh] = useState<string>(targetPh != null ? String(targetPh) : "");
  const [preservative, setPreservative] = useState(preservativeSystem ?? "");
  const [notes, setNotes] = useState(manufacturingNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phColor = getPhColor(ph ? parseFloat(ph) : null);

  const save = useCallback(
    async (data: {
      target_ph?: number | null;
      preservative_system?: string | null;
      manufacturing_notes?: string | null;
    }) => {
      setIsSaving(true);
      try {
        await updateCosmeticDetails(formulaId, data);
      } catch {
        toast.error("Failed to save cosmetic details");
      } finally {
        setIsSaving(false);
      }
    },
    [formulaId]
  );

  const debouncedSave = useCallback(
    (data: Parameters<typeof save>[0]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => save(data), 800);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handlePhChange = (value: string) => {
    setPh(value);
    if (!isOwner) return;
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 14) {
      debouncedSave({ target_ph: parsed });
    } else if (value === "") {
      debouncedSave({ target_ph: null });
    }
  };

  const handlePreservativeChange = (value: string) => {
    setPreservative(value);
    if (!isOwner) return;
    debouncedSave({ preservative_system: value || null });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (!isOwner) return;
    debouncedSave({ manufacturing_notes: value || null });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("cosmeticDetails")}</h3>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Saving...
            </span>
          )}
          {cosmeticProductType && (
            <Badge variant="secondary" className="text-xs">
              {getCosmeticProductTypeLabel(cosmeticProductType)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target-ph">{t("targetPh")}</Label>
          <div className="relative">
            <Input
              id="target-ph"
              type="number"
              min={0}
              max={14}
              step={0.1}
              value={ph}
              onChange={(e) => handlePhChange(e.target.value)}
              disabled={!isOwner}
              placeholder="5.5"
              className={cn(
                "pr-16",
                ph && PH_COLOR_CLASSES[phColor]
              )}
            />
            {ph && (
              <span
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1.5 py-0.5 rounded",
                  phColor === "green" && "bg-emerald-100 text-emerald-700",
                  phColor === "yellow" && "bg-yellow-100 text-yellow-700",
                  phColor === "red" && "bg-red-100 text-red-700"
                )}
              >
                {phColor === "green"
                  ? "Skin-safe"
                  : phColor === "yellow"
                    ? "Caution"
                    : "Warning"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preservative-system">{t("preservativeSystem")}</Label>
          <Input
            id="preservative-system"
            value={preservative}
            onChange={(e) => handlePreservativeChange(e.target.value)}
            disabled={!isOwner}
            placeholder="e.g., Phenoxyethanol 1%"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="manufacturing-notes">{t("manufacturingNotes")}</Label>
        <Textarea
          id="manufacturing-notes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={!isOwner}
          placeholder="Process steps, temperatures, equipment..."
          rows={3}
        />
      </div>
    </Card>
  );
}

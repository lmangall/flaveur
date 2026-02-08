"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/[locale]/components/ui/collapsible";
import { MarkdownEditor } from "@/app/[locale]/components/markdown-editor";
import { updateFormulaNotes } from "@/actions/formulas";
import { toast } from "sonner";
import { ChevronDown, Lightbulb, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormulaNotesCardProps {
  formulaId: number;
  initialNotes: string | null;
  readOnly?: boolean;
}

export function FormulaNotesCard({
  formulaId,
  initialNotes,
  readOnly = false,
}: FormulaNotesCardProps) {
  const t = useTranslations("FormulaNotes");
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);

  // Track last saved value with a ref to avoid effect dependency issues
  const lastSavedRef = useRef(initialNotes || "");

  // Derive hasChanges from current notes vs last saved
  const hasChanges = notes !== lastSavedRef.current;

  // Autosave with debounce
  useEffect(() => {
    if (readOnly) return;
    if (notes === lastSavedRef.current) return; // No changes to save

    const saveTimer = setTimeout(async () => {
      // Capture the value we're about to save
      const valueToSave = notes;

      // Skip if it matches what we already saved (race condition safety)
      if (valueToSave === lastSavedRef.current) return;

      setIsSaving(true);
      try {
        await updateFormulaNotes(formulaId, valueToSave || null);
        lastSavedRef.current = valueToSave;
      } catch (error) {
        console.error("Error auto-saving notes:", error);
        toast.error(t("failedToSaveNotes"));
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(saveTimer);
  }, [notes, readOnly, formulaId, t]);

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
  };

  const notesIdeas = [
    { icon: "🎯", title: t("ideaInspiration"), desc: t("ideaInspirationDesc") },
    { icon: "👃", title: t("ideaTasting"), desc: t("ideaTastingDesc") },
    { icon: "🔬", title: t("ideaModifications"), desc: t("ideaModificationsDesc") },
    { icon: "📦", title: t("ideaSupplier"), desc: t("ideaSupplierDesc") },
    { icon: "💬", title: t("ideaFeedback"), desc: t("ideaFeedbackDesc") },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          {!readOnly && (hasChanges || isSaving) && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              {isSaving ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {t("unsaved")}
                </>
              )}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ideas collapsible - only show in edit mode */}
        {!readOnly && (
          <Collapsible open={isIdeasOpen} onOpenChange={setIsIdeasOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {t("ideasTitle")}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isIdeasOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {notesIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-sm"
                  >
                    <span className="text-lg">{idea.icon}</span>
                    <div>
                      <div className="font-medium">{idea.title}</div>
                      <div className="text-muted-foreground text-xs">
                        {idea.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Markdown Editor */}
        <MarkdownEditor
          value={notes}
          onChange={handleNotesChange}
          placeholder={t("placeholder")}
          editable={!readOnly}
          minHeight="min-h-[200px]"
        />

        {/* Empty state for read-only with no notes */}
        {readOnly && !notes && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t("noNotes")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

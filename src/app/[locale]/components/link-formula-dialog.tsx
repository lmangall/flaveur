"use client";

import { useState, useEffect, useCallback } from "react";
import { FlaskConical, Loader2, Link, Check, Search } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { ScrollArea } from "@/app/[locale]/components/ui/scroll-area";
import { toast } from "sonner";
import { getFormulas } from "@/actions/formulas";
import { linkFormulaToWorkspace } from "@/actions/workspaces";
import type { Formula } from "@/app/type";

interface LinkFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  linkedFormulaIds: number[];
  onFormulaLinked: () => void;
}

export function LinkFormulaDialog({
  open,
  onOpenChange,
  workspaceId,
  linkedFormulaIds,
  onFormulaLinked,
}: LinkFormulaDialogProps) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFormulas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFormulas();
      // Map raw DB result to Formula type
      setFormulas(
        data.map((f: Record<string, unknown>) => ({
          formula_id: Number(f.formula_id),
          name: String(f.name),
          description: f.description ? String(f.description) : null,
          is_public: Boolean(f.is_public),
          user_id: f.user_id ? String(f.user_id) : null,
          category_id: f.category_id ? Number(f.category_id) : null,
          status: String(f.status) as Formula["status"],
          version: Number(f.version),
          base_unit: String(f.base_unit) as Formula["base_unit"],
          flavor_profile: f.flavor_profile as Formula["flavor_profile"],
          notes: f.notes ? String(f.notes) : null,
          project_type: (f.project_type as Formula["project_type"]) || "flavor",
          concentration_type: (f.concentration_type as Formula["concentration_type"]) || null,
          created_at: String(f.created_at),
          updated_at: String(f.updated_at),
        }))
      );
    } catch (error) {
      console.error("Error loading formulas:", error);
      toast.error("Failed to load your formulas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadFormulas();
      setSearchQuery("");
    }
  }, [open, loadFormulas]);

  const handleLinkFormula = async (formulaId: number) => {
    setIsLinking(formulaId);
    try {
      await linkFormulaToWorkspace({ formulaId, workspaceId });
      toast.success("Formula linked to workspace");
      onFormulaLinked();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to link formula"
      );
    } finally {
      setIsLinking(null);
    }
  };

  const filteredFormulas = formulas.filter(( formula) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      formula.name.toLowerCase().includes(query) ||
      formula.description?.toLowerCase().includes(query)
    );
  });

  const availableFormulas = filteredFormulas.filter(
    (f) => !linkedFormulaIds.includes(f.formula_id)
  );
  const alreadyLinked = filteredFormulas.filter((f) =>
    linkedFormulaIds.includes(f.formula_id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Formula</DialogTitle>
          <DialogDescription>
            Share your formulas with this workspace for collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : formulas.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You haven't created any formulas yet.
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => onOpenChange(false)}
              >
                Create your first formula
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {availableFormulas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Available to link ({availableFormulas.length})
                    </p>
                    {availableFormulas.map(( formula) => (
                      <div
                        key={formula.formula_id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                          <FlaskConical className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{formula.name}</p>
                            {formula.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {formula.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline">{formula.status}</Badge>
                          <Button
                            size="sm"
                            onClick={() => handleLinkFormula(formula.formula_id)}
                            disabled={isLinking === formula.formula_id}
                          >
                            {isLinking === formula.formula_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Link className="h-4 w-4 mr-1" />
                                Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {alreadyLinked.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Already linked ({alreadyLinked.length})
                    </p>
                    {alreadyLinked.map(( formula) => (
                      <div
                        key={formula.formula_id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-60 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                          <FlaskConical className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{formula.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Linked</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredFormulas.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No formulas matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

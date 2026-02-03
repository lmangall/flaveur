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
import { getFlavours } from "@/actions/flavours";
import { linkFlavourToWorkspace } from "@/actions/workspaces";
import type { Flavour } from "@/app/type";

interface LinkFlavourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  linkedFlavourIds: number[];
  onFlavourLinked: () => void;
}

export function LinkFlavourDialog({
  open,
  onOpenChange,
  workspaceId,
  linkedFlavourIds,
  onFlavourLinked,
}: LinkFlavourDialogProps) {
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFlavours = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFlavours();
      // Map raw DB result to Flavour type
      setFlavours(
        data.map((f: Record<string, unknown>) => ({
          flavour_id: Number(f.flavour_id),
          name: String(f.name),
          description: f.description ? String(f.description) : null,
          is_public: Boolean(f.is_public),
          user_id: f.user_id ? String(f.user_id) : null,
          category_id: f.category_id ? Number(f.category_id) : null,
          status: String(f.status) as Flavour["status"],
          version: Number(f.version),
          base_unit: String(f.base_unit) as Flavour["base_unit"],
          flavor_profile: f.flavor_profile as Flavour["flavor_profile"],
          notes: f.notes ? String(f.notes) : null,
          created_at: String(f.created_at),
          updated_at: String(f.updated_at),
        }))
      );
    } catch (error) {
      console.error("Error loading flavours:", error);
      toast.error("Failed to load your flavours");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadFlavours();
      setSearchQuery("");
    }
  }, [open, loadFlavours]);

  const handleLinkFlavour = async (flavourId: number) => {
    setIsLinking(flavourId);
    try {
      await linkFlavourToWorkspace({ flavourId, workspaceId });
      toast.success("Flavour linked to workspace");
      onFlavourLinked();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to link flavour"
      );
    } finally {
      setIsLinking(null);
    }
  };

  const filteredFlavours = flavours.filter((flavour) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      flavour.name.toLowerCase().includes(query) ||
      flavour.description?.toLowerCase().includes(query)
    );
  });

  const availableFlavours = filteredFlavours.filter(
    (f) => !linkedFlavourIds.includes(f.flavour_id)
  );
  const alreadyLinked = filteredFlavours.filter((f) =>
    linkedFlavourIds.includes(f.flavour_id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Flavour</DialogTitle>
          <DialogDescription>
            Share your flavours with this workspace for collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your flavours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flavours.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You haven't created any flavours yet.
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => onOpenChange(false)}
              >
                Create your first flavour
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {availableFlavours.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Available to link ({availableFlavours.length})
                    </p>
                    {availableFlavours.map((flavour) => (
                      <div
                        key={flavour.flavour_id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                          <FlaskConical className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{flavour.name}</p>
                            {flavour.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {flavour.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline">{flavour.status}</Badge>
                          <Button
                            size="sm"
                            onClick={() => handleLinkFlavour(flavour.flavour_id)}
                            disabled={isLinking === flavour.flavour_id}
                          >
                            {isLinking === flavour.flavour_id ? (
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
                    {alreadyLinked.map((flavour) => (
                      <div
                        key={flavour.flavour_id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-60 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                          <FlaskConical className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{flavour.name}</p>
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

                {filteredFlavours.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No flavours matching "{searchQuery}"
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

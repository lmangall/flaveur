"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { toast } from "sonner";
import { createVariation } from "@/actions/variations";
import { DEFAULT_VARIATION_LABELS } from "@/constants/flavour";

interface CreateVariationDialogProps {
  sourceFlavourId: number;
  onVariationCreated?: () => void;
}

export function CreateVariationDialog({
  sourceFlavourId,
  onVariationCreated,
}: CreateVariationDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!label.trim()) {
      toast.error("Please enter a variation label");
      return;
    }

    setIsCreating(true);
    try {
      await createVariation(sourceFlavourId, label.trim());
      toast.success(`Variation "${label}" created`);
      setOpen(false);
      setLabel("");
      onVariationCreated?.();
    } catch (error) {
      console.error("Error creating variation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create variation"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickSelect = (value: string) => {
    setLabel(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Variation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Variation</DialogTitle>
          <DialogDescription>
            Create a new variation of this formula. The new variation will be a
            copy that you can modify independently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Variation Label</Label>
            <Input
              id="label"
              placeholder='e.g., "A", "Light", "Natural", "v2"'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={isCreating}
            />
          </div>

          {/* Quick select buttons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick select</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_VARIATION_LABELS.map((item) => (
                <Button
                  key={item.value}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickSelect(item.value)}
                  disabled={isCreating}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !label.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create & Edit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

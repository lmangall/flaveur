"use client";

import { useState } from "react";
import { Pencil, Loader2, Copy } from "lucide-react";
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
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Checkbox } from "@/app/[locale]/components/ui/checkbox";
import { toast } from "sonner";
import {
  updateVariationDetails,
  syncVariationDescriptions,
} from "@/actions/variations";
import type { FormulaVariation } from "@/actions/variations";

interface EditVariationDialogProps {
  variation: FormulaVariation;
  onVariationUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function EditVariationDialog({
  variation,
  onVariationUpdated,
  trigger,
}: EditVariationDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(variation.variation_label || "");
  const [description, setDescription] = useState(variation.description || "");
  const [syncToAll, setSyncToAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update the variation details
      await updateVariationDetails(variation.formula_id, {
        label: label.trim() || undefined,
        description: description.trim() || null,
      });

      // Sync description to all variations if requested
      if (syncToAll) {
        await syncVariationDescriptions(variation.formula_id);
        toast.success("Variation updated and description synced to all variations");
      } else {
        toast.success("Variation updated");
      }

      setOpen(false);
      onVariationUpdated?.();
    } catch (error) {
      console.error("Error updating variation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update variation"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form to current values when opening
      setLabel(variation.variation_label || "");
      setDescription(variation.description || "");
      setSyncToAll(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Variation</DialogTitle>
          <DialogDescription>
            Update the label and description for this variation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Variation Label</Label>
            <Input
              id="label"
              placeholder='e.g., "Light", "Strong", "Natural"'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              This is the name shown in the variation pills
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what makes this variation different..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="syncToAll"
              checked={syncToAll}
              onCheckedChange={(checked) => setSyncToAll(checked === true)}
              disabled={isSaving}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="syncToAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Apply description to all variations
              </label>
              <p className="text-xs text-muted-foreground">
                This will copy this description to all other variations in the group
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

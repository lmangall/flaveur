"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/[locale]/components/ui/alert-dialog";

interface DeleteMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitorLabel: string | null;
  onConfirm: () => void;
}

export function DeleteMonitorDialog({
  open,
  onOpenChange,
  monitorLabel,
  onConfirm,
}: DeleteMonitorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the monitor and all its discovered listings.
            <br />
            <strong>{monitorLabel}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/app/[locale]/components/ui/button";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { EmptyState } from "@/app/[locale]/components/ui/empty-state";
import { SITE_KEY_OPTIONS } from "@/constants/job-monitor";

import {
  getJobSearchMonitors,
  updateJobSearchMonitor,
  deleteJobSearchMonitor,
} from "@/actions/admin/job-monitors";

import { MonitorOverview } from "./components/MonitorOverview";
import type { Monitor } from "./components/MonitorCard";
import { MonitorTable } from "./components/MonitorTable";
import { AddMonitorForm } from "./components/AddMonitorForm";
import { DeleteMonitorDialog } from "./components/DeleteMonitorDialog";

export default function AdminJobMonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterSiteKey, setFilterSiteKey] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Add monitor form
  const [showAddForm, setShowAddForm] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      if (filterSiteKey !== "all" && m.site_key !== filterSiteKey) return false;
      if (filterStatus === "active" && !m.is_active) return false;
      if (filterStatus === "paused" && m.is_active) return false;
      if (filterStatus === "error" && !m.last_error) return false;
      return true;
    });
  }, [monitors, filterSiteKey, filterStatus]);

  // Derive available site keys from data
  const siteKeys = useMemo(() => {
    const keys = new Set(monitors.map((m) => m.site_key));
    return SITE_KEY_OPTIONS.filter((opt) => keys.has(opt.value));
  }, [monitors]);

  const fetchMonitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getJobSearchMonitors();
      setMonitors(data as Monitor[]);
    } catch (error) {
      console.error("Failed to fetch monitors:", error);
      toast.error("Failed to load job monitors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  const handleToggleActive = async (monitor: Monitor) => {
    try {
      await updateJobSearchMonitor(monitor.id, {
        is_active: !monitor.is_active,
      });
      toast.success(
        monitor.is_active ? "Monitor paused" : "Monitor activated"
      );
      fetchMonitors();
    } catch {
      toast.error("Failed to update monitor");
    }
  };

  const handleDeleteClick = (monitor: Monitor) => {
    setMonitorToDelete(monitor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!monitorToDelete) return;
    try {
      await deleteJobSearchMonitor(monitorToDelete.id);
      toast.success("Monitor deleted");
      setDeleteDialogOpen(false);
      setMonitorToDelete(null);
      fetchMonitors();
    } catch {
      toast.error("Failed to delete monitor");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Monitors</h1>
          <p className="text-muted-foreground">
            Monitor job search pages for new listings
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Monitor
        </Button>
      </div>

      {/* Add Monitor Form */}
      {showAddForm && (
        <AddMonitorForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchMonitors();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Overview Stats */}
      {monitors.length > 0 && <MonitorOverview monitors={monitors} />}

      {/* Filters */}
      {monitors.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">Filter:</span>

          {/* Source filter */}
          <Badge
            variant={filterSiteKey === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterSiteKey("all")}
          >
            All sources
          </Badge>
          {siteKeys.map((opt) => (
            <Badge
              key={opt.value}
              variant={filterSiteKey === opt.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setFilterSiteKey(
                  filterSiteKey === opt.value ? "all" : opt.value
                )
              }
            >
              {opt.label}
            </Badge>
          ))}

          <span className="text-muted-foreground/30 mx-1">|</span>

          {/* Status filter */}
          <Badge
            variant={filterStatus === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterStatus("all")}
          >
            All statuses
          </Badge>
          {(
            [
              { value: "active", label: "Active" },
              { value: "paused", label: "Paused" },
              { value: "error", label: "With errors" },
            ] as const
          ).map((opt) => (
            <Badge
              key={opt.value}
              variant={filterStatus === opt.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setFilterStatus(
                  filterStatus === opt.value ? "all" : opt.value
                )
              }
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Monitor Table */}
      {monitors.length === 0 ? (
        <EmptyState
          icon="search"
          title="No monitors configured"
          description="Add a monitor to start tracking job search pages for new listings."
          action={{
            label: "Add your first monitor",
            onClick: () => setShowAddForm(true),
          }}
        />
      ) : filteredMonitors.length === 0 ? (
        <EmptyState
          icon="search"
          title="No monitors match filters"
          description="Try adjusting your filters to see more monitors."
          action={{
            label: "Clear filters",
            onClick: () => {
              setFilterSiteKey("all");
              setFilterStatus("all");
            },
            variant: "outline",
          }}
          size="sm"
        />
      ) : (
        <MonitorTable
          monitors={filteredMonitors}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteMonitorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        monitorLabel={monitorToDelete?.label ?? null}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

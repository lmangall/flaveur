"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
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
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

import {
  getJobSearchMonitors,
  createJobSearchMonitor,
  updateJobSearchMonitor,
  deleteJobSearchMonitor,
  getRecentNewListings,
} from "@/actions/admin/job-monitors";
import { SITE_KEY_OPTIONS } from "@/constants/job-monitor";

type Monitor = {
  id: number;
  label: string;
  search_url: string;
  site_key: string;
  is_active: boolean;
  last_checked_at: string | null;
  last_listing_count: number | null;
  last_error: string | null;
  created_at: string | null;
};

type RecentListing = {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  employment_type: string | null;
  listing_url: string;
  first_seen_at: string | null;
  monitor_label: string;
  imported_job_id: string | null;
  on_platform: boolean;
};

export default function AdminJobMonitorsPage() {
  const locale = useLocale();

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add monitor form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newSiteKey, setNewSiteKey] = useState("hellowork");
  const [isAdding, setIsAdding] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [monitorsData, listingsData] = await Promise.all([
        getJobSearchMonitors(),
        getRecentNewListings(50),
      ]);
      setMonitors(monitorsData as Monitor[]);
      setRecentListings(listingsData as RecentListing[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load job monitors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMonitor = async () => {
    if (!newLabel.trim() || !newUrl.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    setIsAdding(true);
    try {
      await createJobSearchMonitor({
        label: newLabel.trim(),
        search_url: newUrl.trim(),
        site_key: newSiteKey,
      });
      toast.success("Monitor added");
      setShowAddForm(false);
      setNewLabel("");
      setNewUrl("");
      setNewSiteKey("hellowork");
      fetchData();
    } catch (error) {
      console.error("Failed to add monitor:", error);
      toast.error("Failed to add monitor");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (monitor: Monitor) => {
    try {
      await updateJobSearchMonitor(monitor.id, {
        is_active: !monitor.is_active,
      });
      toast.success(
        monitor.is_active ? "Monitor paused" : "Monitor activated"
      );
      fetchData();
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
      fetchData();
    } catch {
      toast.error("Failed to delete monitor");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelative = (dateString: string | null) => {
    if (!dateString) return "Never";
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <h3 className="font-semibold">New Monitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Label (e.g., HelloWork - Aromaticien)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <Select value={newSiteKey} onValueChange={setNewSiteKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITE_KEY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Search URL (paste the full search results page URL)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddMonitor} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Monitor"}
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Monitors Table */}
      {monitors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No monitors configured</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first monitor
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.map((monitor) => (
                <TableRow key={monitor.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{monitor.label}</span>
                      <a
                        href={monitor.search_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-muted-foreground hover:text-foreground inline-flex items-center"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {monitor.last_error && (
                      <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="truncate max-w-[300px]">
                          {monitor.last_error}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{monitor.site_key}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={monitor.is_active ? "default" : "secondary"}
                    >
                      {monitor.is_active ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelative(monitor.last_checked_at)}
                    </div>
                  </TableCell>
                  <TableCell>{monitor.last_listing_count ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(monitor)}
                        title={
                          monitor.is_active
                            ? "Pause monitor"
                            : "Activate monitor"
                        }
                      >
                        {monitor.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(monitor)}
                        title="Delete monitor"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Recent Discoveries */}
      {recentListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Discoveries</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Found</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      {listing.title}
                    </TableCell>
                    <TableCell>{listing.company || "-"}</TableCell>
                    <TableCell>{listing.location || "-"}</TableCell>
                    <TableCell>
                      {listing.employment_type ? (
                        <Badge variant="outline">
                          {listing.employment_type}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {listing.on_platform && listing.imported_job_id ? (
                        <Link
                          href={`/${locale}/jobs/${listing.imported_job_id}`}
                          className="inline-flex items-center gap-1 text-green-600 hover:underline text-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          On platform
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={listing.listing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title={listing.listing_url}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {listing.monitor_label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(listing.first_seen_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the monitor and all its discovered listings.
              <br />
              <strong>{monitorToDelete?.label}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

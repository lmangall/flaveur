"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
  Clock,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

import { cn } from "@/app/lib/utils";
import { Button } from "@/app/[locale]/components/ui/button";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { EmptyState } from "@/app/[locale]/components/ui/empty-state";

import {
  getMonitoredListings,
  scrapeListingDetail,
} from "@/actions/admin/job-monitors";
import { LINKEDIN_LOCATION_OPTIONS } from "@/constants/job-monitor";
import {
  isLinkedInSearchUrl,
  decodeLinkedInSearchUrl,
} from "@/lib/job-monitors/linkedin-params";
import { MonitorListingsTable, type MonitorListing } from "./MonitorListingsTable";
import type { Monitor } from "./MonitorCard";

interface MonitorTableProps {
  monitors: Monitor[];
  onToggleActive: (monitor: Monitor) => void;
  onDelete: (monitor: Monitor) => void;
}

function formatRelative(dateString: string | null) {
  if (!dateString) return "Never";
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSearchDescription(monitor: Monitor): string | null {
  if (!isLinkedInSearchUrl(monitor.search_url)) return null;
  try {
    const p = decodeLinkedInSearchUrl(monitor.search_url);
    const loc = LINKEDIN_LOCATION_OPTIONS.find((l) => l.value === p.locationId);
    return `"${p.keywords}" · ${loc?.label || p.locationId}`;
  } catch {
    return "LinkedIn";
  }
}

function ExpandedListings({
  monitor,
}: {
  monitor: Monitor;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [listings, setListings] = useState<MonitorListing[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [importingId, setImportingId] = useState<number | null>(null);

  useEffect(() => {
    getMonitoredListings(monitor.id)
      .then((data) => setListings(data as MonitorListing[]))
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setIsLoading(false));
  }, [monitor.id]);

  const handleImport = async (listing: MonitorListing) => {
    setImportingId(listing.id);
    try {
      const prefillData = await scrapeListingDetail(listing.id);
      sessionStorage.setItem("importJobData", JSON.stringify(prefillData));
      sessionStorage.setItem("importListingId", String(listing.id));
      router.push(`/${locale}/admin/jobs/new?import=true`);
    } catch (error) {
      console.error("Failed to scrape listing:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import listing"
      );
      setImportingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="px-4 py-3">
        <EmptyState
          icon="search"
          title="No listings discovered yet"
          description="Listings will appear here after the next cron run"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <MonitorListingsTable
        listings={listings}
        importingId={importingId}
        onImport={handleImport}
      />
    </div>
  );
}

export function MonitorTable({
  monitors,
  onToggleActive,
  onDelete,
}: MonitorTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpanded = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (monitors.length === 0) return null;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Label</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.map((monitor) => {
            const isExpanded = expandedId === monitor.id;
            const searchDesc = getSearchDescription(monitor);

            return (
              <Fragment key={monitor.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer",
                    !monitor.is_active && "opacity-60",
                    monitor.last_error && "bg-destructive/5"
                  )}
                  onClick={() => toggleExpanded(monitor.id)}
                >
                  {/* Expand chevron */}
                  <TableCell className="pr-0">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </TableCell>

                  {/* Label */}
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <span className="line-clamp-1">{monitor.label}</span>
                      {searchDesc && (
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {searchDesc}
                        </span>
                      )}
                      {monitor.last_error && (
                        <span className="flex items-center gap-1 text-xs text-destructive mt-0.5">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[300px]">
                            {monitor.last_error}
                          </span>
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <Badge variant="outline">{monitor.site_key}</Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={monitor.is_active ? "default" : "secondary"}
                    >
                      {monitor.is_active ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>

                  {/* Last Checked */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelative(monitor.last_checked_at)}
                    </span>
                  </TableCell>

                  {/* Listings count */}
                  <TableCell className="text-sm">
                    {monitor.last_listing_count ?? 0}
                  </TableCell>

                  {/* Actions hamburger */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onToggleActive(monitor)}
                        >
                          {monitor.is_active ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={monitor.search_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open search URL
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(monitor)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded listings row */}
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0 bg-muted/30">
                      <ExpandedListings monitor={monitor} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

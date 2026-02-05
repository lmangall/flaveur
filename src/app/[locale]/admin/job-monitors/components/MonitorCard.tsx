"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  ChevronDown,
  ExternalLink,
  Clock,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

import { cn } from "@/app/lib/utils";
import { Button } from "@/app/[locale]/components/ui/button";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/app/[locale]/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/[locale]/components/ui/collapsible";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { EmptyState } from "@/app/[locale]/components/ui/empty-state";

import { getMonitoredListings, scrapeListingDetail } from "@/actions/admin/job-monitors";
import { LINKEDIN_LOCATION_OPTIONS } from "@/constants/job-monitor";
import {
  isLinkedInSearchUrl,
  decodeLinkedInSearchUrl,
} from "@/lib/job-monitors/linkedin-params";
import { MonitorListingsTable, type MonitorListing } from "./MonitorListingsTable";

export type Monitor = {
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

interface MonitorCardProps {
  monitor: Monitor;
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

export function MonitorCard({
  monitor,
  onToggleActive,
  onDelete,
}: MonitorCardProps) {
  const locale = useLocale();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState<MonitorListing[] | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);

  // Lazy load listings on first expand
  useEffect(() => {
    if (isOpen && listings === null) {
      setIsLoadingListings(true);
      getMonitoredListings(monitor.id)
        .then((data) => setListings(data as MonitorListing[]))
        .catch(() => toast.error("Failed to load listings"))
        .finally(() => setIsLoadingListings(false));
    }
  }, [isOpen, listings, monitor.id]);

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

  const importedCount = listings
    ? listings.filter((l) => l.imported_job_id).length
    : 0;
  const totalCount = listings?.length ?? monitor.last_listing_count ?? 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className={cn(
          "transition-colors",
          monitor.last_error && "border-destructive/50",
          !monitor.is_active && "opacity-60"
        )}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left side: chevron + label + badges */}
              <div className="flex items-center gap-3 min-w-0">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">
                      {monitor.label}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {monitor.site_key}
                    </Badge>
                    <Badge
                      variant={monitor.is_active ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {monitor.is_active ? "Active" : "Paused"}
                    </Badge>
                    {isLinkedInSearchUrl(monitor.search_url) ? (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(() => {
                          try {
                            const p = decodeLinkedInSearchUrl(monitor.search_url);
                            const loc = LINKEDIN_LOCATION_OPTIONS.find(
                              (l) => l.value === p.locationId
                            );
                            return `"${p.keywords}" · ${loc?.label || p.locationId}`;
                          } catch {
                            return "LinkedIn";
                          }
                        })()}
                      </span>
                    ) : (
                      <a
                        href={monitor.search_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        title="Open search page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {monitor.last_error && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[400px]">
                        {monitor.last_error}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right side: stats + actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="whitespace-nowrap">
                    {formatRelative(monitor.last_checked_at)}
                  </span>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {totalCount} listing{totalCount !== 1 ? "s" : ""}
                  {importedCount > 0 && (
                    <span className="ml-1 text-green-600">
                      ({importedCount} imported)
                    </span>
                  )}
                </Badge>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleActive(monitor)}
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
                    className="h-8 w-8"
                    onClick={() => onDelete(monitor)}
                    title="Delete monitor"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {isLoadingListings ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <MonitorListingsTable
                listings={listings}
                importingId={importingId}
                onImport={handleImport}
              />
            ) : (
              <EmptyState
                icon="search"
                title="No listings discovered yet"
                description="Listings will appear here after the next cron run"
                size="sm"
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

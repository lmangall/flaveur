"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ExternalLink,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";

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

export type MonitorListing = {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  employment_type: string | null;
  salary: string | null;
  listing_url: string;
  imported_job_id: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
};

interface MonitorListingsTableProps {
  listings: MonitorListing[];
  importingId: number | null;
  onImport: (listing: MonitorListing) => void;
}

function formatRelative(dateString: string | null) {
  if (!dateString) return "—";
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MonitorListingsTable({
  listings,
  importingId,
  onImport,
}: MonitorListingsTableProps) {
  const locale = useLocale();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company / Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Found</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-medium max-w-[300px]">
                <span className="line-clamp-1">{listing.title}</span>
              </TableCell>
              <TableCell>
                <div>
                  <span className="text-sm">
                    {listing.company || "—"}
                  </span>
                  {listing.location && (
                    <span className="block text-xs text-muted-foreground">
                      {listing.location}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {listing.employment_type ? (
                  <Badge variant="outline">{listing.employment_type}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {listing.imported_job_id ? (
                  <Link
                    href={`/${locale}/jobs/${listing.imported_job_id}`}
                    className="inline-flex items-center gap-1 text-green-600 hover:underline text-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    On platform
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onImport(listing)}
                    disabled={importingId === listing.id}
                    title="Import to platform"
                  >
                    {importingId === listing.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="ml-1.5">Import</span>
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatRelative(listing.first_seen_at)}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

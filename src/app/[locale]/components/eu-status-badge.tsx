"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/app/[locale]/components/ui/tooltip";
import {
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  getSubstanceEUStatus,
  SubstanceEUStatus,
} from "@/actions/regulatory";

interface Props {
  chemicalName: string;
  alternativeNames?: string[];
  showLink?: boolean;
  compact?: boolean;
}

export function EUStatusBadge({
  chemicalName,
  alternativeNames,
  showLink = true,
  compact = false,
}: Props) {
  const [status, setStatus] = useState<SubstanceEUStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSubstanceEUStatus(chemicalName, alternativeNames)
      .then((result) => {
        if (!cancelled) setStatus(result);
      })
      .catch(() => {
        if (!cancelled) setStatus({ found: false, status: "not_found" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [chemicalName, alternativeNames]);

  if (loading) {
    return compact ? (
      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
    ) : (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking EU...
      </Badge>
    );
  }

  if (!status?.found) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 cursor-help">
              <HelpCircle className="h-3 w-3" />
              {!compact && "EU: "}Unknown
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Not found in EU Food Additives database</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const isApproved = status.status === "approved";

  return (
    <div className="flex items-center gap-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={isApproved ? "success" : "warning"}
              className="gap-1 cursor-help"
            >
              {isApproved ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {!compact && "EU: "}
              {isApproved ? "Approved" : "Restricted"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{status.name}</p>
            {status.eNumber && (
              <p className="text-xs opacity-80">{status.eNumber}</p>
            )}
            <p className="text-xs opacity-80">{status.legislation}</p>
            {status.restrictions && status.restrictions.length > 0 && (
              <p className="text-xs mt-1">
                {status.restrictions[0].comment || status.restrictions[0].type}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showLink && status.detailsUrl && (
        <a
          href={status.detailsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

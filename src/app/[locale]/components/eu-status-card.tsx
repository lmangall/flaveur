"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  getSubstanceEUStatus,
  SubstanceEUStatus,
} from "@/actions/regulatory";

interface Props {
  chemicalName: string;
  alternativeNames?: string[];
}

export function EUStatusCard({ chemicalName, alternativeNames }: Props) {
  const [status, setStatus] = useState<SubstanceEUStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSubstanceEUStatus(chemicalName, alternativeNames)
      .then((result) => {
        if (!cancelled) setStatus(result);
      })
      .catch((err) => {
        console.error("Error fetching EU status:", err);
        if (!cancelled) setStatus({ found: false, status: "not_found" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [chemicalName, alternativeNames]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Checking EU regulatory status...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          EU Regulatory Status
          {status?.found && (
            <Badge variant={status.status === "approved" ? "success" : "warning"}>
              {status.status === "approved" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Restricted
                </>
              )}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!status?.found ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Not found in EU Food Additives database</span>
          </div>
        ) : (
          <>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">EU Name</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {status.name}
                </span>
              </div>
              {status.eNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E Number</span>
                  <span>{status.eNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legislation</span>
                <span>{status.legislation}</span>
              </div>
            </div>

            {status.restrictions && status.restrictions.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium mb-2">Restrictions</p>
                {status.restrictions.map((r, idx) => (
                  <div key={idx} className="text-xs bg-muted p-2 rounded mb-1">
                    <p className="font-medium">{r.foodCategory}</p>
                    {r.value && (
                      <p>
                        Max: {r.value} {r.unit}
                      </p>
                    )}
                    {r.comment && (
                      <p className="text-muted-foreground">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {status.detailsUrl && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={status.detailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on EU Portal
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

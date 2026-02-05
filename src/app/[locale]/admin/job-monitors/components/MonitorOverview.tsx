"use client";

import {
  Activity,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/app/[locale]/components/ui/card";
import type { Monitor } from "./MonitorCard";

interface MonitorOverviewProps {
  monitors: Monitor[];
}

export function MonitorOverview({ monitors }: MonitorOverviewProps) {
  const activeCount = monitors.filter((m) => m.is_active).length;
  const totalListings = monitors.reduce(
    (sum, m) => sum + (m.last_listing_count ?? 0),
    0
  );
  const errorCount = monitors.filter((m) => m.last_error).length;

  const stats = [
    {
      label: "Active Monitors",
      value: `${activeCount}/${monitors.length}`,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      label: "Total Listings",
      value: String(totalListings),
      icon: FileSearch,
      color: "text-foreground",
    },
    {
      label: "With Errors",
      value: String(errorCount),
      icon: errorCount > 0 ? AlertTriangle : CheckCircle2,
      color: errorCount > 0 ? "text-destructive" : "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 py-4 px-5">
            <div className={stat.color}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

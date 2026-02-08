"use client";

import {
  ComplianceResult,
  ComplianceIssue,
} from "@/lib/eu-compliance/checker";
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
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Props {
  result: ComplianceResult;
}

export function ComplianceResultView({ result }: Props) {
  const locale = useLocale();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/formulas/${result.formulaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{result.formulaName}</h1>
          <p className="text-sm text-muted-foreground">
            EU Compliance Check &bull;{" "}
            {new Date(result.checkedAt).toLocaleString()}
          </p>
        </div>
        <ComplianceStatusBadge isCompliant={result.isCompliant} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Substances"
          value={result.totalSubstances}
          icon={Info}
        />
        <SummaryCard
          label="Approved"
          value={result.summary.approved}
          icon={CheckCircle}
          variant="success"
        />
        <SummaryCard
          label="Issues"
          value={result.summary.errors}
          icon={XCircle}
          variant={result.summary.errors > 0 ? "error" : "default"}
        />
        <SummaryCard
          label="Warnings"
          value={result.summary.warnings + result.summary.notFound}
          icon={AlertTriangle}
          variant={result.summary.warnings > 0 ? "warning" : "default"}
        />
      </div>

      {/* Issues List */}
      {result.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues & Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.issues.map((issue, idx) => (
              <IssueItem key={idx} issue={issue} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Clear */}
      {result.isCompliant && result.summary.notFound === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Compliant</p>
                <p className="text-sm text-green-700">
                  All substances in this formulation comply with EU regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back button */}
      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link href={`/${locale}/formulas/${result.formulaId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Formula
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ComplianceStatusBadge({ isCompliant }: { isCompliant: boolean }) {
  return (
    <Badge
      variant={isCompliant ? "success" : "destructive"}
      className="text-sm px-3 py-1"
    >
      {isCompliant ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1.5" />
          EU Compliant
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 mr-1.5" />
          Not Compliant
        </>
      )}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: "default" | "success" | "error" | "warning";
}) {
  const colors = {
    default: "text-muted-foreground",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-amber-600",
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors[variant]}`} />
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function IssueItem({ issue }: { issue: ComplianceIssue }) {
  const severityConfig = {
    error: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    info: {
      icon: Info,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className={`p-3 rounded-lg border ${config.bg} flex items-start gap-3`}
    >
      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{issue.substanceName}</span>
          <Badge variant="outline" className="text-xs">
            {issue.type.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm mt-1">{issue.message}</p>
        {issue.details?.foodCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Category: {issue.details.foodCategory}
          </p>
        )}
      </div>
      {issue.euUrl && (
        <a
          href={issue.euUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

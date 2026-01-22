"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { checkFlavourEUCompliance } from "@/actions/compliance";
import { ComplianceResult } from "@/lib/eu-compliance/checker";
import { ComplianceResultView } from "./compliance-result-view";
import { Card, CardContent } from "@/app/[locale]/components/ui/card";
import { Button } from "@/app/[locale]/components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function CompliancePage() {
  const params = useParams();
  const locale = useLocale();
  const flavourId = parseInt(params.id as string, 10);

  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(flavourId)) {
      setError("Invalid flavour ID");
      setLoading(false);
      return;
    }

    checkFlavourEUCompliance(flavourId)
      .then(setResult)
      .catch((err) => {
        console.error("Error checking compliance:", err);
        setError(err.message || "Failed to check compliance");
      })
      .finally(() => setLoading(false));
  }, [flavourId]);

  if (loading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Checking EU Compliance</p>
              <p className="text-sm text-muted-foreground">
                Analyzing substances against EU FLAVIS database...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-red-200">
          <CardContent className="py-8 flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="text-center">
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/flavours/${flavourId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flavour
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">No compliance data available</p>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/flavours/${flavourId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flavour
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <ComplianceResultView result={result} />
    </div>
  );
}

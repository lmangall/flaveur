"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, SlidersHorizontal, BarChart3, Award } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getVariationsForFlavour } from "@/actions/variations";
import type { ComparisonData } from "@/actions/variations";
import { ComparisonTable } from "@/app/[locale]/components/ComparisonTable";
import { RadarOverlay } from "@/app/[locale]/components/RadarOverlay";
import { VariationPills } from "@/app/[locale]/components/VariationPills";
import { HowItWorks } from "@/app/[locale]/components/HowItWorks";

function LoadingState() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

function NoVariationsState({ flavourId }: { flavourId: number }) {
  const locale = useLocale();
  const t = useTranslations("Variations");

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-2">{t("noVariations")}</h2>
          <p className="text-muted-foreground text-center mb-4">
            {t("noVariationsDesc")}
          </p>
          <Button asChild>
            <Link href={`/${locale}/flavours/${flavourId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToFormula")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Variations");
  const flavourId = parseInt(params.id as string, 10);

  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getVariationsForFlavour(flavourId);
      if (result) {
        setData(result);
        setVisibleIds(new Set(result.variations.map((v) => v.flavour_id)));
      } else {
        setData(null);
      }
    } catch (err) {
      console.error("Error loading variations:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(flavourId)) {
      loadData();
    }
  }, [flavourId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.variations.length === 0) {
    return <NoVariationsState flavourId={flavourId} />;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/flavours/${flavourId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("compareTitle")}
          </h1>
          <p className="text-muted-foreground">{data.group.name}</p>
        </div>
      </div>

      {/* How it works */}
      <HowItWorks
        title={t("howItWorksTitle")}
        steps={[
          {
            icon: Plus,
            title: t("step1Title"),
            description: t("step1Description"),
          },
          {
            icon: SlidersHorizontal,
            title: t("step2Title"),
            description: t("step2Description"),
          },
          {
            icon: BarChart3,
            title: t("step3Title"),
            description: t("step3Description"),
          },
        ]}
        tip={{
          icon: Award,
          title: t("tipTitle"),
          description: t("tipDescription"),
        }}
        faqLink={{
          text: t("faqLinkText"),
        }}
      />

      {/* Variation pills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("variations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <VariationPills flavourId={flavourId} />
        </CardContent>
      </Card>

      {/* Radar overlay */}
      <RadarOverlay variations={data.variations} visibleIds={visibleIds} />

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("substanceComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonTable data={data} onDataChange={loadData} />
        </CardContent>
      </Card>
    </div>
  );
}

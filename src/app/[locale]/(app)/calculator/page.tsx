"use client";

import { useTranslations } from "next-intl";
import FlavoringCalculator from "@/app/[locale]/components/FlavoringCalculator";

export default function CalculatorPage() {
  const t = useTranslations("Calculator");

  return (
    <div className="container max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("description")}
        </p>
      </div>
      <FlavoringCalculator />
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { MousePointer, SlidersHorizontal, BarChart3, Award } from "lucide-react";
import { HowItWorks } from "@/app/[locale]/components/HowItWorks";

export function SamplesHowItWorks() {
  const t = useTranslations("Samples");

  return (
    <HowItWorks
      title={t("howItWorksTitle")}
      steps={[
        {
          icon: MousePointer,
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
        category: "sharing",
      }}
    />
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface OnboardingFeatureProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  titleKey: string;
  descriptionKey: string;
  highlights: { icon: LucideIcon; textKey: string }[];
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function OnboardingFeature({
  icon: Icon,
  iconColor,
  iconBgColor,
  titleKey,
  descriptionKey,
  highlights,
  onNext,
  onBack,
  onSkip,
  isLoading,
}: OnboardingFeatureProps) {
  const t = useTranslations("Onboarding");

  return (
    <div className="flex flex-col space-y-6 py-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t(titleKey)}</h2>
          <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {highlights.map((highlight, index) => {
          const HighlightIcon = highlight.icon;
          return (
            <li key={index} className="flex items-start gap-3 text-sm">
              <HighlightIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{t(highlight.textKey)}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            {t("skip")}
          </Button>
          <Button onClick={onNext} disabled={isLoading}>
            {t("next")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

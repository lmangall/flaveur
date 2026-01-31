"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Beaker } from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function OnboardingWelcome({
  onNext,
  onSkip,
  isLoading,
}: OnboardingWelcomeProps) {
  const t = useTranslations("Onboarding");

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Beaker className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("welcomeTitle")}</h2>
        <p className="text-muted-foreground">{t("welcomeSubtitle")}</p>
      </div>

      <p className="text-sm text-muted-foreground">{t("welcomeBody")}</p>

      <div className="flex flex-col sm:flex-row gap-2 w-full pt-4">
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1"
        >
          {t("skip")}
        </Button>
        <Button onClick={onNext} disabled={isLoading} className="flex-1">
          {t("getStarted")}
        </Button>
      </div>
    </div>
  );
}

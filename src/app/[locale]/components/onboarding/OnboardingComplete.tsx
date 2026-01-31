"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { PartyPopper, FlaskConical, BookOpen, Users } from "lucide-react";

interface OnboardingCompleteProps {
  onFinish: () => void;
}

export function OnboardingComplete({ onFinish }: OnboardingCompleteProps) {
  const t = useTranslations("Onboarding");

  const suggestions = [
    { icon: FlaskConical, text: t("completeSuggestion1") },
    { icon: BookOpen, text: t("completeSuggestion2") },
    { icon: Users, text: t("completeSuggestion3") },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <PartyPopper className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("completeTitle")}</h2>
        <p className="text-muted-foreground">{t("completeSubtitle")}</p>
      </div>

      <ul className="text-left space-y-3 w-full">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <li key={index} className="flex items-center gap-3 text-sm">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span>{suggestion.text}</span>
            </li>
          );
        })}
      </ul>

      <Button onClick={onFinish} className="w-full mt-4">
        {t("finish")}
      </Button>
    </div>
  );
}

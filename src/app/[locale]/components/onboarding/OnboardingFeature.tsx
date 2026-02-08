"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface OnboardingFeatureProps {
  icon: LucideIcon;
  accentHue?: number; // HSL hue value (default 330 for pink)
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
  accentHue = 330,
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
    <div className="flex flex-col space-y-6 py-2">
      {/* Icon with animated glow */}
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="relative">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-40 animate-pulse-glow"
            style={{
              background: `linear-gradient(135deg, hsl(${accentHue} 80% 60%), hsl(${accentHue} 70% 50%))`,
            }}
          />
          {/* Icon container */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, hsl(${accentHue} 80% 95%), hsl(${accentHue} 70% 90%))`,
            }}
          >
            <Icon
              className="w-8 h-8"
              style={{ color: `hsl(${accentHue} 70% 45%)` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{t(titleKey)}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {t(descriptionKey)}
          </p>
        </div>
      </div>

      {/* Highlights list with stagger animation */}
      <ul className="space-y-3 stagger-children-fast">
        {highlights.map((highlight, index) => {
          const HighlightIcon = highlight.icon;
          return (
            <li
              key={index}
              className="flex items-start gap-3 text-sm p-3 rounded-xl bg-muted/50 dark:bg-muted/30 border border-transparent hover:border-pink/20 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${accentHue} 80% 95%), hsl(${accentHue} 70% 90%))`,
                }}
              >
                <HighlightIcon
                  className="w-4 h-4"
                  style={{ color: `hsl(${accentHue} 70% 45%)` }}
                />
              </div>
              <span className="pt-1.5 text-foreground/80">{t(highlight.textKey)}</span>
            </li>
          );
        })}
      </ul>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="text-muted-foreground/70 hover:text-muted-foreground"
          >
            {t("skip")}
          </Button>
          <Button
            onClick={onNext}
            disabled={isLoading}
            className="bg-gradient-to-r from-pink to-pink/80 hover:from-pink/90 hover:to-pink/70 text-white shadow-lg shadow-pink/25 hover:shadow-pink/40 transition-all duration-300"
          >
            {t("next")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

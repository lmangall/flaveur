"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

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
      {/* Animated logo/icon with floating sparkles */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink/40 to-pink/10 blur-2xl scale-150 animate-pulse-glow" />

        {/* Main icon container */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink to-pink/70 flex items-center justify-center shadow-2xl shadow-pink/30 animate-float">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Floating accent dots */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-pink/80 to-pink/60 animate-float-fast shadow-lg shadow-pink/40"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-gradient-to-br from-pink/60 to-pink/40 animate-float-fast shadow-md shadow-pink/30"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Title with gradient text */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-pink via-pink/80 to-pink/60 bg-clip-text text-transparent">
            {t("welcomeTitle")}
          </span>
        </h2>
        <p className="text-muted-foreground font-medium">{t("welcomeSubtitle")}</p>
      </div>

      {/* Body text */}
      <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
        {t("welcomeBody")}
      </p>

      {/* Feature preview pills */}
      <div className="flex flex-wrap justify-center gap-2 py-2">
        {["Formulas", "Learning", "Workspaces"].map((feature, index) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pink/10 text-pink border border-pink/20 stagger-children-fast"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Zap className="w-3 h-3" />
            {feature}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1 text-muted-foreground/70 hover:text-muted-foreground"
        >
          {t("skip")}
        </Button>
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-pink to-pink/80 hover:from-pink/90 hover:to-pink/70 text-white shadow-lg shadow-pink/25 hover:shadow-pink/40 transition-all duration-300 group"
        >
          {t("getStarted")}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

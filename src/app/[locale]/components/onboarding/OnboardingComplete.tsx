"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { PartyPopper, FlaskConical, BookOpen, Users, Sparkles, Check } from "lucide-react";

interface OnboardingCompleteProps {
  onFinish: () => void;
  isLoading?: boolean;
}

export function OnboardingComplete({ onFinish, isLoading }: OnboardingCompleteProps) {
  const t = useTranslations("Onboarding");

  const suggestions = [
    { icon: FlaskConical, text: t("completeSuggestion1") },
    { icon: BookOpen, text: t("completeSuggestion2") },
    { icon: Users, text: t("completeSuggestion3") },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      {/* Celebration icon with animated effects */}
      <div className="relative">
        {/* Outer celebration glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink/50 to-pink/20 blur-2xl scale-[2] animate-pulse-glow" />

        {/* Sparkle accents */}
        <Sparkles
          className="absolute -top-3 -right-2 w-5 h-5 text-pink animate-float-fast"
          style={{ animationDelay: "0.1s" }}
        />
        <Sparkles
          className="absolute -bottom-1 -left-3 w-4 h-4 text-pink/70 animate-float-fast"
          style={{ animationDelay: "0.4s" }}
        />
        <Sparkles
          className="absolute top-1/2 -right-5 w-3 h-3 text-pink/50 animate-float-fast"
          style={{ animationDelay: "0.7s" }}
        />

        {/* Main icon */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink to-pink/70 flex items-center justify-center shadow-2xl shadow-pink/40 animate-float">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>

        {/* Success checkmark badge */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-background border-2 border-pink flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-pink" />
        </div>
      </div>

      {/* Title with gradient */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-pink via-pink/80 to-pink/60 bg-clip-text text-transparent">
            {t("completeTitle")}
          </span>
        </h2>
        <p className="text-muted-foreground">{t("completeSubtitle")}</p>
      </div>

      {/* Suggestions list with stagger animation */}
      <ul className="text-left space-y-3 w-full stagger-children-fast">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <li
              key={index}
              className="flex items-center gap-3 text-sm p-3 rounded-xl bg-muted/50 dark:bg-muted/30 border border-transparent hover:border-pink/20 transition-all duration-300 hover:translate-x-1 cursor-default"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink/20 to-pink/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-pink" />
              </div>
              <span className="text-foreground/80">{suggestion.text}</span>
            </li>
          );
        })}
      </ul>

      {/* Finish button */}
      <Button
        onClick={onFinish}
        disabled={isLoading}
        className="w-full mt-4 bg-gradient-to-r from-pink to-pink/80 hover:from-pink/90 hover:to-pink/70 text-white shadow-lg shadow-pink/25 hover:shadow-pink/40 transition-all duration-300 h-12 text-base font-medium animate-pink-glow"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t("finish")}
      </Button>
    </div>
  );
}

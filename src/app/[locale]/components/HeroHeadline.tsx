"use client";

import { useTranslations } from "next-intl";
import { TypewriterText } from "@/app/[locale]/components/ui/typewriter-text";

export function HeroHeadline() {
  const t = useTranslations("Home");

  const words = [
    t("typewriterWord1"),
    t("typewriterWord2"),
    t("typewriterWord3"),
  ];

  return (
    <h1 className="hero-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground/70">
      {t("heroHeadlinePrefix")}{" "}
      <span className="inline-block min-w-[200px] sm:min-w-[280px] md:min-w-[340px] lg:min-w-[420px]">
        <TypewriterText
          words={words}
          className="text-foreground/70"
          typingSpeed={60}
          deletingSpeed={30}
          pauseDuration={1500}
        />
      </span>
    </h1>
  );
}

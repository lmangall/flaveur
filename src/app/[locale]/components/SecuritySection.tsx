"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ui/scroll-reveal";
import { ScrambledText } from "./ui/scrambled-text";

export function SecuritySection() {
  const t = useTranslations("Home");

  return (
    <section className="snap-section relative w-full min-h-screen py-24 md:py-32 overflow-hidden flex items-center">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                <ScrambledText
                  scrambledClassName="text-pink-500/70"
                  revealedClassName="text-pink-500"
                  settledClassName="text-foreground"
                  radius={100}
                  revealDuration={150}
                  settleDuration={2500}
                >
                  {t("securityTitle")}
                </ScrambledText>
              </h2>
            </div>

            {/* Scrambled text content */}
            <div className="text-center">
              <div className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
                <ScrambledText
                  scrambledClassName="text-pink-500/70"
                  revealedClassName="text-pink-500"
                  settledClassName="text-foreground"
                  radius={100}
                  revealDuration={150}
                  settleDuration={2500}
                >
                  {t("securityText")}
                </ScrambledText>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FlaskConical,
  Users,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";

import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";
import { ScrollReveal } from "@/app/[locale]/components/ui/scroll-reveal";
import { FeatureShowcase } from "@/app/[locale]/components/ui/feature-showcase";
import { GradientText } from "@/app/[locale]/components/ui/gradient-text";
import { WavesBackground } from "@/app/[locale]/components/WavesBackground";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home",
    description:
      "Master the art of flavor creation. Learn, create, and showcase your flavor compositions.",
  };
}

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="snap-section relative w-full min-h-screen flex items-center overflow-hidden">
          {/* Base background */}
          {/* <div className="absolute inset-0 -z-10 bg-background" /> */}

          {/* Interactive waves background */}
          <WavesBackground />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-20 xl:grid-cols-[1fr_550px] items-center">
              {/* Left content */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Headline */}
                <div className="space-y-4">
                  <h1 className="hero-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground/70">
                    {t("headline")}
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 text-lg md:text-xl leading-relaxed">
                    <span className="hero-desc delay-300 inline-block">{t("heroDescription")}</span>
                    <br />
                    <span className="hero-desc delay-500 inline-block">{t("heroDescription2")}</span>
                  </p>
                </div>

                {/* Social proof */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 reveal-up delay-700">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink/10">
                      <FlaskConical className="h-4 w-4 text-pink" />
                    </div>
                    <span className="text-foreground/80">{t("socialProofSubstances")}</span>
                  </div>
                  <div className="h-8 w-px bg-pink/20 hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink/10">
                      <Sparkles className="h-4 w-4 text-pink" />
                    </div>
                    <span className="text-foreground/80">{t("socialProofReleased")}</span>
                  </div>
                  <div className="h-8 w-px bg-pink/20 hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink/10">
                      <Users className="h-4 w-4 text-pink" />
                    </div>
                    <span className="text-foreground/80">{t("socialProofCommunity")}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row reveal-up delay-1000">
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-pink to-pink/80 px-10 text-base font-semibold text-white shadow-lg shadow-pink/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink/40"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    <span className="relative flex items-center gap-2">
                      {t("startCreating")}
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right - Hero visual */}
              <div className="flex items-center justify-center lg:justify-end logo-bounce delay-200">
                <div className="relative h-[230px] w-[320px] sm:h-[290px] sm:w-[400px] lg:h-[310px] lg:w-[450px] overflow-hidden">
                  <Image
                    src="/logo_transparent_bg.png"
                    alt="Flaveur Logo"
                    width={450}
                    height={450}
                    className="object-cover object-top logo-adaptive"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Feature Showcase Section - Scroll-snap immersive layouts */}
        <FeatureShowcase />

        {/* Newsletter CTA Section */}
        <section
          id="newsletter"
          className="snap-section relative w-full min-h-screen py-24 md:py-32 lg:py-40 overflow-hidden flex items-center"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10 bg-muted" />

          {/* Central glow behind content */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-pink/15 blur-[120px] animate-pulse-glow pointer-events-none" />

          {/* Accent orbs */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-pink/10 blur-3xl animate-breathe pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-pink/8 blur-3xl animate-pulse-glow delay-500 pointer-events-none" />

          {/* Interactive waves background */}
          <WavesBackground />

          <div className="container mx-auto relative z-10 px-4 md:px-6">
            <ScrollReveal animation="blur">
              <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {t("NewsletterTitle")}
                </h2>
                <p className="text-xl text-foreground/80 max-w-xl">
                  {t("NewsletterDescription")}
                </p>
                <div className="w-full max-w-md">
                  <NewsletterSignup />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}

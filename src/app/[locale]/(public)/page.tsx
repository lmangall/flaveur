import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Lightbulb,
  Handshake,
  HandCoins,
  GitCompare,
  Users,
  Brain,
  UserCircle,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  Check,
} from "lucide-react";
import { Metadata } from "next";

import { Button } from "@/app/[locale]/components/ui/button";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";

const FEATURE_SHOWCASE = [
  {
    icon: GitCompare,
    titleKey: "featureVariationsTitle",
    descriptionKey: "featureVariationsDesc",
    bullets: ["featureVariationsBullet1", "featureVariationsBullet2", "featureVariationsBullet3"],
    imagePosition: "right" as const,
    accentColor: "primary",
  },
  {
    icon: Sparkles,
    titleKey: "featureAITitle",
    descriptionKey: "featureAIDesc",
    bullets: ["featureAIBullet1", "featureAIBullet2", "featureAIBullet3"],
    imagePosition: "left" as const,
    accentColor: "secondary",
  },
  {
    icon: Users,
    titleKey: "featureWorkspacesTitle",
    descriptionKey: "featureWorkspacesDesc",
    bullets: ["featureWorkspacesBullet1", "featureWorkspacesBullet2", "featureWorkspacesBullet3"],
    imagePosition: "right" as const,
    accentColor: "primary",
  },
  {
    icon: Brain,
    titleKey: "featureLearningTitle",
    descriptionKey: "featureLearningDesc",
    bullets: ["featureLearningBullet1", "featureLearningBullet2", "featureLearningBullet3"],
    imagePosition: "left" as const,
    accentColor: "secondary",
  },
  {
    icon: UserCircle,
    titleKey: "featureProfilesTitle",
    descriptionKey: "featureProfilesDesc",
    bullets: ["featureProfilesBullet1", "featureProfilesBullet2", "featureProfilesBullet3"],
    imagePosition: "right" as const,
    accentColor: "primary",
  },
  {
    icon: ShieldCheck,
    titleKey: "featureComplianceTitle",
    descriptionKey: "featureComplianceDesc",
    bullets: ["featureComplianceBullet1", "featureComplianceBullet2", "featureComplianceBullet3"],
    imagePosition: "left" as const,
    accentColor: "secondary",
  },
];

const FEATURES_GRID = [
  {
    icon: BookOpen,
    titleKey: "learn",
    descriptionKey: "learnDescription",
    number: "01",
    size: "large" as const,
  },
  {
    icon: Lightbulb,
    titleKey: "create",
    descriptionKey: "createDescription",
    number: "02",
    size: "small" as const,
  },
  {
    icon: HandCoins,
    titleKey: "showcase",
    descriptionKey: "showcaseDescription",
    number: "03",
    size: "small" as const,
  },
];

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
        <section className="relative w-full py-20 md:py-32 lg:py-40 xl:py-52 overflow-hidden grain-overlay">
          {/* Background with pink gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-background" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-pink/8 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-pink/5 via-transparent to-transparent" />
          </div>

          {/* Floating pink orbs */}
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-pink/10 blur-3xl animate-pulse-glow pointer-events-none" />
          <div className="absolute bottom-40 left-10 w-24 h-24 rounded-full bg-pink/15 blur-2xl animate-float delay-500 pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-pink/8 blur-xl animate-float delay-300 pointer-events-none" />

          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-20 xl:grid-cols-[1fr_550px] items-center">
              {/* Left content */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Headline */}
                <div className="space-y-4 reveal-up delay-100">
                  <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                    <span className="block">{t("headline")}</span>
                    <span className="block bg-gradient-to-r from-foreground via-pink to-foreground bg-clip-text text-transparent">
                      {t("masterFlavor")}
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed reveal-up delay-200">
                    {t("heroDescription")}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row reveal-up delay-300">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-semibold shadow-lg hover:shadow-pink/25 hover:border-pink/50 transition-all group pink-glow"
                    asChild
                  >
                    <Link href="/auth/sign-up">
                      {t("startCreating")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base"
                    asChild
                  >
                    <Link href="/samples">
                      {t("exploreSamples")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-6 pt-4 reveal-up delay-400">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink/10">
                      <FlaskConical className="h-4 w-4 text-pink" />
                    </div>
                    <span className="text-muted-foreground">500+ flavors created</span>
                  </div>
                  <div className="h-8 w-px bg-pink/20" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink/10">
                      <Users className="h-4 w-4 text-pink" />
                    </div>
                    <span className="text-muted-foreground">Growing community</span>
                  </div>
                </div>
              </div>

              {/* Right - Hero visual */}
              <div className="flex items-center justify-center lg:justify-end scale-in delay-200">
                <div className="relative">
                  {/* Main logo container */}
                  <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                    <Image
                      src="/logo_transparent_bg.png"
                      alt="Flaveur Logo"
                      width={450}
                      height={450}
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Features Section - Asymmetric Grid */}
        <section id="features" className="w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {t("everythingYouNeed")}
                </h2>
                <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
                  {t("platformDescription")}
                </p>
              </div>
            </div>

            {/* Asymmetric features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {FEATURES_GRID.map((feature, index) => (
                <div
                  key={index}
                  className={`group feature-card rounded-2xl border bg-card p-8 ${
                    feature.size === "large" ? "md:row-span-2" : ""
                  }`}
                >
                  {/* Number label */}
                  <span className="text-6xl font-bold text-muted/30 group-hover:text-pink/40 transition-colors">
                    {feature.number}
                  </span>

                  <div className="mt-4 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted group-hover:bg-pink/15 transition-colors">
                      <feature.icon className="h-7 w-7 text-foreground group-hover:text-pink transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold">{t(feature.titleKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Feature Showcase Section - Alternating Layout */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                {t("featureShowcaseTitle")}
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
                {t("featureShowcaseDesc")}
              </p>
            </div>

            <div className="space-y-32">
              {FEATURE_SHOWCASE.map((feature, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-12 lg:gap-20 items-center ${
                    feature.imagePosition === "left"
                      ? "lg:flex-row-reverse"
                      : "lg:flex-row"
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-3">
                      <div className="rounded-2xl p-3 bg-muted">
                        <feature.icon className="h-6 w-6 text-foreground" />
                      </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {t(feature.descriptionKey)}
                    </p>
                    <ul className="space-y-3 pt-2">
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-pink/15">
                            <Check className="h-3 w-3 text-pink" />
                          </div>
                          <span className="text-muted-foreground">{t(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual placeholder - styled as app screenshot */}
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden">
                      {/* Screenshot frame */}
                      <div className="absolute inset-0 bg-muted border rounded-2xl">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/50">
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                        </div>
                        {/* Content area */}
                        <div className="flex items-center justify-center h-[calc(100%-48px)]">
                          <feature.icon className="h-20 w-20 text-muted-foreground/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Jobs Section */}
        <section id="jobs" className="w-full py-20 md:py-32 lg:py-40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                {t("discoverCareer")}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                {t("findJobDescription")}
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 mb-12">
              <div className="feature-card flex flex-col items-center space-y-4 rounded-2xl border bg-card p-8 text-center group">
                <div className="rounded-2xl bg-muted group-hover:bg-pink/15 p-4 transition-colors">
                  <Handshake className="h-8 w-8 text-foreground group-hover:text-pink transition-colors" />
                </div>
                <h3 className="text-2xl font-bold">{t("careerGrowth")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("careerGrowthDescription")}
                </p>
              </div>
              <div className="feature-card flex flex-col items-center space-y-4 rounded-2xl border bg-card p-8 text-center group">
                <div className="rounded-2xl bg-muted group-hover:bg-pink/15 p-4 transition-colors">
                  <HandCoins className="h-8 w-8 text-foreground group-hover:text-pink transition-colors" />
                </div>
                <h3 className="text-2xl font-bold">{t("jobListings")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("jobListingsDescription")}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base" asChild>
                <Link href="/jobs">
                  {t("browseJobs")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA Section */}
        <section
          id="newsletter"
          className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10 bg-muted" />

          <div className="container mx-auto relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {t("NewsletterTitle")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl">
                {t("NewsletterDescription")}
              </p>
              <div className="w-full max-w-md">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

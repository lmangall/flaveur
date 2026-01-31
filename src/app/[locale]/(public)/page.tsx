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
  Layers,
  Zap,
  Check,
} from "lucide-react";
import { Metadata } from "next";

import { Button } from "@/app/[locale]/components/ui/button";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";

const PARTNER_LOGOS = [
  { src: "/school_logo/ISIPCA.png", alt: "ISIPCA - Institut Supérieur International du Parfum" },
  { src: "/school_logo/mane.png", alt: "Mane - Fragrance & Flavor Company" },
  { src: "/school_logo/Universite_monptellier.png", alt: "Université de Montpellier" },
  { src: "/school_logo/universite_le_havre.jpg", alt: "Université Le Havre Normandie" },
];

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
          {/* Background gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background" />
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-chart-2/10 rounded-full blur-[100px] animate-pulse-glow delay-1000" />
          </div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-20 xl:grid-cols-[1fr_550px] items-center">
              {/* Left content */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Badge */}
                <div className="reveal-up">
                  <Badge
                    variant="secondary"
                    className="w-fit px-4 py-2 text-sm font-medium"
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    {t("heroTagline") || "The platform for flavor creators"}
                  </Badge>
                </div>

                {/* Headline */}
                <div className="space-y-4 reveal-up delay-100">
                  <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                    <span className="block">{t("headline")}</span>
                    <span className="block bg-linear-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
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
                    className="h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all cta-glow group"
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
                    className="h-14 px-8 text-base gradient-border"
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <FlaskConical className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">500+ flavors created</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Growing community</span>
                  </div>
                </div>
              </div>

              {/* Right - Hero visual with molecular animation */}
              <div className="flex items-center justify-center lg:justify-end scale-in delay-200">
                <div className="relative">
                  {/* Orbital rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] lg:w-[520px] lg:h-[520px] rounded-full border border-primary/20 animate-spin-slow" />
                    <div className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[440px] lg:h-[440px] rounded-full border border-chart-2/15" style={{ animationDirection: 'reverse', animationDuration: '40s' }} />
                  </div>

                  {/* Orbiting molecular nodes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute molecular-node animate-orbit"
                      style={{ '--orbit-radius': '200px', '--orbit-duration': '15s' } as React.CSSProperties}
                    />
                    <div
                      className="absolute molecular-node-lg animate-orbit delay-500"
                      style={{ '--orbit-radius': '160px', '--orbit-duration': '20s' } as React.CSSProperties}
                    />
                    <div
                      className="absolute molecular-node-sm animate-orbit delay-1000"
                      style={{ '--orbit-radius': '240px', '--orbit-duration': '25s' } as React.CSSProperties}
                    />
                  </div>

                  {/* Central glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] rounded-full bg-linear-to-br from-primary/20 via-transparent to-chart-2/20 blur-2xl animate-pulse-glow" />
                  </div>

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

                  {/* Floating feature cards */}
                  <div className="absolute -left-4 top-1/4 hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-3 shadow-xl animate-float">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
                      <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Variations</span>
                  </div>
                  <div className="absolute -right-4 top-2/3 hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-3 shadow-xl animate-float delay-700">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-2/20">
                      <Zap className="h-4 w-4 text-chart-2" />
                    </div>
                    <span className="text-sm font-medium">AI-Powered</span>
                  </div>
                  <div className="absolute left-1/4 -bottom-4 hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-3 shadow-xl animate-float delay-300">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-5/20">
                      <Users className="h-4 w-4 text-chart-5" />
                    </div>
                    <span className="text-sm font-medium">Collaborate</span>
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
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                  {t("features")}
                </Badge>
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
                  className={`group feature-card gradient-border rounded-2xl border bg-card p-8 ${
                    feature.size === "large" ? "md:row-span-2" : ""
                  }`}
                >
                  {/* Number label */}
                  <span className="text-6xl font-bold text-muted/30 group-hover:text-primary/30 transition-colors">
                    {feature.number}
                  </span>

                  <div className="mt-4 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-7 w-7 text-primary" />
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
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                {t("featureShowcaseTag")}
              </Badge>
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
                      <div className="rounded-2xl p-3 bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
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
                          <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-primary/20">
                            <Check className="h-3 w-3 text-primary" />
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
                      <div className="absolute inset-0 bg-linear-to-br from-muted/80 to-muted border rounded-2xl">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/50">
                          <div className="w-3 h-3 rounded-full bg-red-400/60" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                          <div className="w-3 h-3 rounded-full bg-green-400/60" />
                        </div>
                        {/* Content area */}
                        <div className="flex items-center justify-center h-[calc(100%-48px)]">
                          <feature.icon className="h-20 w-20 text-muted-foreground/20" />
                        </div>
                      </div>
                      {/* Decorative glow */}
                      <div className="absolute -inset-4 rounded-3xl blur-2xl -z-10 bg-primary/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Trusted By Section - Marquee */}
        <section className="w-full py-20 md:py-28 overflow-hidden">
          <div className="container px-4 md:px-6 mb-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                Trusted Partners
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t("trustedBy")}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-lg">
                {t("platformRecognition")}
              </p>
            </div>
          </div>

          {/* Marquee container */}
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-background to-transparent z-10" />

            {/* Scrolling logos */}
            <div className="flex animate-marquee">
              {/* First set */}
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, i) => {
                let sizeClasses = "h-20 w-28";
                if (logo.src.includes("Universite_monptellier")) {
                  sizeClasses = "h-20 w-16";
                } else if (logo.src.includes("mane") || logo.src.includes("universite_le_havre")) {
                  sizeClasses = "h-24 w-32";
                }

                return (
                  <div
                    key={i}
                    className="flex items-center justify-center mx-12 shrink-0"
                  >
                    <div className={`relative ${sizeClasses} opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300`}>
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Jobs Section */}
        <section id="jobs" className="w-full py-20 md:py-32 lg:py-40 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                {t("jobsSection")}
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                {t("discoverCareer")}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                {t("findJobDescription")}
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 mb-12">
              <div className="feature-card gradient-border flex flex-col items-center space-y-4 rounded-2xl border bg-card p-8 text-center">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t("careerGrowth")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("careerGrowthDescription")}
                </p>
              </div>
              <div className="feature-card gradient-border flex flex-col items-center space-y-4 rounded-2xl border bg-card p-8 text-center">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <HandCoins className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t("jobListings")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("jobListingsDescription")}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base gradient-border" asChild>
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
          className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden grain-overlay"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 -z-10 bg-primary" />

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 molecular-node-lg opacity-30" />
          <div className="absolute bottom-10 right-10 molecular-node opacity-30" />
          <div className="absolute top-1/2 left-1/4 molecular-node-sm opacity-20" />
          <div className="absolute bottom-1/4 right-1/3 molecular-node opacity-20" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-primary-foreground">
                {t("NewsletterTitle")}
              </h2>
              <p className="text-xl text-primary-foreground/90 max-w-xl">
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

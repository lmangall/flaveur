import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  HandCoins,
  ChevronRight,
  Lightbulb,
  Handshake,
} from "lucide-react";
import { Metadata } from "next";

import { Button } from "@/app/[locale]/components/ui/button";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";

const PARTNER_LOGOS = [
  { src: "/school_logo/ISIPCA.png", alt: "ISIPCA - Institut Supérieur International du Parfum" },
  { src: "/school_logo/mane.png", alt: "Mane - Fragrance & Flavor Company" },
  { src: "/school_logo/Universite_monptellier.png", alt: "Université de Montpellier" },
  { src: "/school_logo/universite_le_havre.jpg", alt: "Université Le Havre Normandie" },
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t("headline")} <br />
                    {t("masterFlavor")}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("learnCreateShowcase")}{" "}
                    {/* Translation for Learn, Create, Showcase */}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/flavours">
                      {t("createFlavor")}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/substances">
                      {t("exploreSubstances")}{" "}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                  <Image
                    src="/logo_transparent_bg.png"
                    alt="Flaveur Logo"
                    width={450}
                    height={450}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t("features")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("everythingYouNeed")}{" "}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("platformDescription")}{" "}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("learn")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("learnDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("create")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("createDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <HandCoins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("showcase")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("showcaseDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("trustedBy")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("platformRecognition")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-4">
              {PARTNER_LOGOS.map((logo, i) => {
                let sizeClasses =
                  "relative h-36 w-32 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0";

                if (logo.src.includes("Universite_monptellier")) {
                  sizeClasses =
                    "relative h-32 w-20 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0";
                } else if (logo.src.includes("mane") || logo.src.includes("universite_le_havre")) {
                  sizeClasses =
                    "relative h-44 w-40 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0";
                }

                return (
                  <div key={i} className="flex items-center justify-center">
                    <div className={sizeClasses}>
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

        {/* Jobs Section - Commented Out */}
        <section
          id="jobs"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t("jobsSection")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("discoverCareer")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("findJobDescription")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("careerGrowth")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("careerGrowthDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <HandCoins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("jobListings")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("jobListingsDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="newsletter"
          className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {t("NewsletterTitle")}
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                {t("NewsletterDescription")}
              </p>
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

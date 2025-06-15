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

const ISIPCA = "/school_logo/ISIPCA.png";
const Mane = "/school_logo/mane.png";
const UniversiteMontpellier = "/school_logo/Universite_monptellier.png";
const UniversiteLeHavre = "/school_logo/universite_le_havre.jpg";

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
                  {t("features")} {/* Translation for Features */}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("everythingYouNeed")}{" "}
                  {/* Translation for Everything You Need to Succeed */}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("platformDescription")}{" "}
                  {/* Translation for platform description */}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("learn")}</h3>{" "}
                {/* Translation for Learn */}
                <p className="text-center text-muted-foreground">
                  {t("learnDescription")}{" "}
                  {/* Translation for Learn description */}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("create")}</h3>{" "}
                <p className="text-center text-muted-foreground">
                  {t("createDescription")}{" "}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <HandCoins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("showcase")}</h3>{" "}
                <p className="text-center text-muted-foreground">
                  {t("showcaseDescription")}{" "}
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {[ISIPCA, Mane, UniversiteMontpellier, UniversiteLeHavre].map(
            (logo, i) => {
              let sizeClasses =
                "relative h-36 w-32 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0";

              if (logo === UniversiteMontpellier) {
                sizeClasses =
                  "relative h-32 w-20 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"; // smaller
              } else if (logo === Mane || logo === UniversiteLeHavre) {
                sizeClasses =
                  "relative h-44 w-40 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"; // bigger
              }

              return (
                <div key={i} className="flex items-center justify-center">
                  <div className={sizeClasses}>
                    <Image
                      src={logo}
                      alt={`School Logo ${i + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>

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
              {/* <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {t("industryConnections")}
                </h3>
                <p className="text-center text-muted-foreground">
                  {t("industryConnectionsDescription")}
                </p>
              </div> */}
            </div>
            {/* <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href="/jobs">
                  {t("browseJobs")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div> */}
          </div>
        </section>

        {/* Student Benefits Section */}
        {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                  <Image
                    src="/placeholder.svg?height=450&width=450"
                    alt={t("studentsUsingApp")} // Translation for Students using app
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                    {t("forStudents")}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    {t("launchFlavorCareer")}{" "}
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    {t("studentDescription")}{" "}
                  </p>
                </div>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("buildPortfolio")} </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("learnMethodologies")} </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("connectEmployers")} </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("receiveFeedback")}</span>{" "}
                  </li>
                </ul>
                <div>
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      {t("startJourney")}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Testimonials Section */}
        {/* <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t("testimonials")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("successStories")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("hearFromStudents")}{" "}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Alex Johnson",
                  role: "Flavor Scientist at FlavorTech",
                  quote:
                    "Oumamie helped me build a portfolio that landed me my dream job. The tools and resources are unmatched.",
                },
                {
                  name: "Sarah Chen",
                  role: "Graduate Student",
                  quote:
                    "As a student, I've found Oumamie invaluable for practicing and perfecting my flavor compositions.",
                },
                {
                  name: "Miguel Rodriguez",
                  role: "Junior Flavor Developer",
                  quote:
                    "From classroom to laboratory, Oumamie bridged the gap and helped me showcase my skills to employers.",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm"
                >
                  <div className="relative h-16 w-16 rounded-full">
                    <Image
                      src={`https://i.pravatar.cc/64?img=${i + 10}`}
                      alt={testimonial.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                  <p className="text-center text-muted-foreground">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

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

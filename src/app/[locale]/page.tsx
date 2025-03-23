import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/app/[locale]/components/ui/button";
import { useTranslations } from "next-intl";

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
                    {t("headline")} {/* Dynamic translation for headline */}
                    {t("masterFlavor")} {/* Translation for master flavor */}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("learnCreateShowcase")}{" "}
                    {/* Translation for Learn, Create, Showcase */}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/create">
                      {t("createFlavor")}{" "}
                      {/* Translation for Create Your First Flavor */}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/explore">
                      {t("exploreSubstances")}{" "}
                      {/* Translation for Explore Substances */}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {/* <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                  <Image
                    src="https://placehold.co/600x400"
                    alt="App Screenshot"
                    width={450}
                    height={450}
                    className="object-cover"
                  />
                </div> */}
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
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("create")}</h3>{" "}
                {/* Translation for Create */}
                <p className="text-center text-muted-foreground">
                  {t("createDescription")}{" "}
                  {/* Translation for Create description */}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BriefcaseBusiness className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("showcase")}</h3>{" "}
                {/* Translation for Showcase */}
                <p className="text-center text-muted-foreground">
                  {t("showcaseDescription")}{" "}
                  {/* Translation for Showcase description */}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section id="trusted" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("trustedBy")}
                </h2>{" "}
                {/* Translation for Trusted By Industry Leaders */}
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("platformRecognition")}{" "}
                  {/* Translation for platform recognition */}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="relative h-12 w-32 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                    <Image
                      src={`https://source.unsplash.com/128x48/?business,logo&sig=${i}`}
                      alt={`Company ${i}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section
          id="jobs"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t("jobsSection")}{" "}
                  {/* Translation for 'Find Your Next Job' */}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("discoverCareer")}{" "}
                  {/* Translation for 'Discover Careers in the Flavor Industry' */}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("findJobDescription")}{" "}
                  {/* Translation for job search description */}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BriefcaseBusiness className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("jobListings")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("jobListingsDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("careerGrowth")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("careerGrowthDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {t("industryConnections")}
                </h3>
                <p className="text-center text-muted-foreground">
                  {t("industryConnectionsDescription")}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href="/jobs">
                  {t("browseJobs")} {/* Translation for 'Browse Jobs' */}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Student Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
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
                    {t("forStudents")} {/* Translation for For Students */}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    {t("launchFlavorCareer")}{" "}
                    {/* Translation for Launch Your Flavor Career */}
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    {t("studentDescription")}{" "}
                    {/* Translation for description */}
                  </p>
                </div>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      {t("buildPortfolio")}{" "}
                      {/* Translation for Build a professional portfolio */}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      {t("learnMethodologies")}{" "}
                      {/* Translation for Learn from industry-standard methodologies */}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      {t("connectEmployers")}{" "}
                      {/* Translation for Connect with potential employers */}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("receiveFeedback")}</span>{" "}
                    {/* Translation for Receive feedback */}
                  </li>
                </ul>
                <div>
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      {t("startJourney")}{" "}
                      {/* Translation for Start Your Journey */}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t("testimonials")} {/* Translation for Testimonials */}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("successStories")} {/* Translation for Success Stories */}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("hearFromStudents")}{" "}
                  {/* Translation for Hear from students */}
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
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  {t("readyToMaster")}{" "}
                  {/* Translation for Ready to Master Flavor Creation */}
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("joinOumamie")}{" "}
                  {/* Translation for Join thousands of students */}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    {t("getStarted")}{" "}
                    {/* Translation for Get Started for Free */}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/explore">
                    {t("explorePlatform")}{" "}
                    {/* Translation for Explore the Platform */}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

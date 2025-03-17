import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Beaker,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
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
                    Master the Art of Flavor Creation
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Learn, create, and showcase your flavor compositions. The
                    ultimate platform for aspiring flavor scientists.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/create">
                      Create Your First Flavor
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/explore">
                      Explore Substances
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
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive platform provides all the tools you need to
                  learn, create, and showcase your flavor expertise.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Learn</h3>
                <p className="text-center text-muted-foreground">
                  Access comprehensive learning materials, tutorials, and guides
                  from industry experts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Create</h3>
                <p className="text-center text-muted-foreground">
                  Build and test your own flavor compositions with our intuitive
                  creation tools.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BriefcaseBusiness className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Showcase</h3>
                <p className="text-center text-muted-foreground">
                  Build your professional portfolio and connect with potential
                  employers.
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
                  Trusted By Industry Leaders
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is recognized and used by top flavor companies
                  and educational institutions.
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

        {/* Student Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                  <Image
                    src="/placeholder.svg?height=450&width=450"
                    alt="Students using Oumamie"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                    For Students
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Launch Your Flavor Career
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Oumamie is specifically designed to help students transition
                    from learning to professional success.
                  </p>
                </div>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      Build a professional portfolio of your flavor creations
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      Learn from industry-standard methodologies and practices
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      Connect with potential employers looking for fresh talent
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <span>Receive feedback from professionals and peers</span>
                  </li>
                </ul>
                <div>
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Start Your Journey
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
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Success Stories
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from students who have transformed their careers with
                  Oumamie.
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
                  Ready to Master Flavor Creation?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students and professionals who are advancing
                  their careers with Oumamie.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Request a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            <p className="text-sm leading-loose text-center md:text-left">
              © 2025 Oumamie. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm underline underline-offset-4"
            >
              Privacy
            </Link>
            <div className="flex items-center gap-2">
              {["twitter", "github", "linkedin"].map((social) => (
                <Button key={social} variant="ghost" size="icon" asChild>
                  <Link href={`#${social}`}>
                    <Users className="h-4 w-4" />
                    <span className="sr-only">{social}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

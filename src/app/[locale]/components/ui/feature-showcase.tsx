"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Users,
  Brain,
  UserCircle,
  ShieldCheck,
  Check,
  LucideIcon,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import Link from "next/link";
import Image from "next/image";

// Animated counter component
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return <span ref={ref}>{count}</span>;
}

// Custom GitCompare icon - lines only, no shapes at endpoints
const GitCompareNoCircles = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M5 6h6a2 2 0 0 1 2 2v2" />
    <path d="M19 18h-6a2 2 0 0 1-2-2v-2" />
  </svg>
);

type IconComponent = LucideIcon | typeof GitCompareNoCircles;

interface FeatureItem {
  icon: IconComponent;
  titleKey: string;
  descriptionKey: string;
  bullets: string[];
  imagePosition: "left" | "right";
  accentColor: string;
}

const FEATURE_SHOWCASE: FeatureItem[] = [
  {
    icon: GitCompareNoCircles,
    titleKey: "featureVariationsTitle",
    descriptionKey: "featureVariationsDesc",
    bullets: ["featureVariationsBullet1", "featureVariationsBullet2", "featureVariationsBullet3"],
    imagePosition: "right",
    accentColor: "primary",
  },
  // {
  //   icon: Sparkles,
  //   titleKey: "featureAITitle",
  //   descriptionKey: "featureAIDesc",
  //   bullets: ["featureAIBullet1", "featureAIBullet2", "featureAIBullet3"],
  //   imagePosition: "left",
  //   accentColor: "secondary",
  // },
  {
    icon: Users,
    titleKey: "featureWorkspacesTitle",
    descriptionKey: "featureWorkspacesDesc",
    bullets: ["featureWorkspacesBullet1", "featureWorkspacesBullet2", "featureWorkspacesBullet3"],
    imagePosition: "right",
    accentColor: "primary",
  },
  {
    icon: Brain,
    titleKey: "featureLearningTitle",
    descriptionKey: "featureLearningDesc",
    bullets: ["featureLearningBullet1", "featureLearningBullet2", "featureLearningBullet3"],
    imagePosition: "left",
    accentColor: "secondary",
  },
  // {
  //   icon: UserCircle,
  //   titleKey: "featureProfilesTitle",
  //   descriptionKey: "featureProfilesDesc",
  //   bullets: ["featureProfilesBullet1", "featureProfilesBullet2", "featureProfilesBullet3"],
  //   imagePosition: "right",
  //   accentColor: "primary",
  // },
  {
    icon: ShieldCheck,
    titleKey: "featureComplianceTitle",
    descriptionKey: "featureComplianceDesc",
    bullets: ["featureComplianceBullet1", "featureComplianceBullet2", "featureComplianceBullet3"],
    imagePosition: "left",
    accentColor: "secondary",
  },
];

interface FeatureShowcaseProps {
  videoSrc?: string;
}

export function FeatureShowcase({ videoSrc = "/videos/flavour-creation-demo.mp4" }: FeatureShowcaseProps) {
  const t = useTranslations("Home");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Track which section is active using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: null, // Use viewport
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Track if the container is in viewport
  useEffect(() => {
    const containerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      containerObserver.observe(containerRef.current);
    }

    return () => containerObserver.disconnect();
  }, []);

  // Smooth scroll with custom duration
  const smoothScrollTo = useCallback((targetY: number, duration: number = 1200) => {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + difference * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  // Scroll to specific section
  const scrollToSection = useCallback((index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      const rect = section.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
      smoothScrollTo(targetY, 1200); // 1.2 seconds duration
    }
  }, [smoothScrollTo]);

  // Keyboard navigation only when in view
  useEffect(() => {
    if (!isInView) return;

    const totalSections = FEATURE_SHOWCASE.length + 1; // +1 for intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, totalSections - 1);
        scrollToSection(nextIndex);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prevIndex = Math.max(activeIndex - 1, 0);
        scrollToSection(prevIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isInView, scrollToSection]);

  // Pillars for intro section
  const PILLARS = [
    { titleKey: "learn", descKey: "learnDescription", ctaKey: "pillarCta1", href: "/substances" },
    { titleKey: "create", descKey: "createDescription", ctaKey: "pillarCta2", href: "/formulas" },
    { titleKey: "showcase", descKey: "showcaseDescription", ctaKey: "pillarCta3", href: "/jobs" },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Feature sections - normal page flow */}
      <div role="region" aria-label="Feature showcase">
        {/* Intro Section - Three Pillars */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="snap-section-center relative w-full min-h-screen flex items-center overflow-hidden bg-background"
          aria-label={t("everythingYouNeed")}
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 right-0 w-1/3 h-1/2 bg-linear-to-l from-pink/5 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-1/4 w-1/4 h-1/3 bg-linear-to-t from-pink/3 via-transparent to-transparent" />
          </div>

          <div className="absolute w-32 h-32 rounded-full bg-pink/5 blur-3xl animate-breathe pointer-events-none top-20 left-20" />

          <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
            <ScrollReveal animation="fade-up" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {t("everythingYouNeed")}
              </h2>
              <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
                {t("platformDescription")}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PILLARS.map((pillar, i) => (
                <ScrollReveal key={i} animation="fade-up" delay={i * 150}>
                  <Link href={pillar.href} className="block h-full">
                    <div className="group feature-card rounded-2xl border bg-card p-8 h-full text-center cursor-pointer">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold">{t(pillar.titleKey)}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t(pillar.descKey)}
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink/10 text-pink font-medium text-sm group-hover:bg-pink/20 transition-all">
                          <span>
                            {i === 0 ? (
                              <><AnimatedCounter target={500} duration={2500} />+ substances</>
                            ) : (
                              t(pillar.ctaKey)
                            )}
                          </span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-muted-foreground/50 text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50" />
            </div>
          </div>
        </section>

        {FEATURE_SHOWCASE.map((feature, index) => (
          <section
            key={index}
            ref={(el) => { sectionRefs.current[index + 1] = el; }}
            className={`snap-section-center relative w-full min-h-screen flex items-center overflow-hidden ${
              index % 2 === 0 ? "bg-background" : "bg-muted/30"
            }`}
            aria-label={t(feature.titleKey)}
          >
            {/* Subtle background accents */}
            <div className="absolute inset-0 -z-10">
              {index % 2 === 0 ? (
                <>
                  <div className="absolute top-1/4 right-0 w-1/3 h-1/2 bg-linear-to-l from-pink/5 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-1/4 w-1/4 h-1/3 bg-linear-to-t from-pink/3 via-transparent to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-linear-to-br from-pink/5 via-transparent to-transparent" />
                  <div className="absolute bottom-1/4 right-1/4 w-1/4 h-1/4 bg-linear-to-tl from-pink/3 via-transparent to-transparent" />
                </>
              )}
            </div>

            {/* Floating orb */}
            <div
              className={`absolute w-32 h-32 rounded-full bg-pink/5 blur-3xl animate-breathe pointer-events-none ${
                feature.imagePosition === "left" ? "top-20 right-20" : "top-20 left-20"
              }`}
            />

            <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
              <div
                className={`flex flex-col gap-16 lg:gap-24 items-center ${
                  feature.imagePosition === "left"
                    ? "lg:flex-row-reverse"
                    : "lg:flex-row"
                }`}
              >
                {/* Content */}
                <ScrollReveal
                  animation={feature.imagePosition === "left" ? "fade-left" : "fade-right"}
                  className="flex-1 w-full lg:w-1/2"
                >
                  <div className="flex flex-col justify-center space-y-8 max-w-2xl">
                    <div className="space-y-6">
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        {t(feature.titleKey)}
                      </h2>

                      <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed">
                        {t(feature.descriptionKey)}
                      </p>
                    </div>

                    <ul className="space-y-4 pt-4">
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 bg-pink/15 border border-pink/20">
                            <Check className="h-4 w-4 text-pink" />
                          </div>
                          <span className="text-muted-foreground text-lg">{t(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>

                {/* Video/Visual */}
                <ScrollReveal
                  animation={feature.imagePosition === "left" ? "fade-right" : "fade-left"}
                  delay={150}
                  className="flex-1 w-full lg:w-1/2"
                >
                  <div className="flex items-center justify-center w-full">
                    {index === 1 ? (
                      // AI section - show screenshot
                      <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-pink/10">
                        <Image
                          src="/screenshots/ai-demo.png"
                          alt="AI Formula Recognition Demo"
                          width={1280}
                          height={720}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (index === 0 || index === 2 || index === 3 || index === 4) ? (
                      <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-pink/10">
                        <video
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source
                            src={
                              index === 0 ? videoSrc :
                              index === 2 ? "/videos/workspaces-demo.mp4" :
                              index === 3 ? "/videos/learning-demo.mp4" :
                              "/videos/compliance-demo.mp4"
                            }
                            type="video/mp4"
                          />
                        </video>
                      </div>
                    ) : (
                      <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden screenshot-frame shadow-2xl shadow-pink/10">
                        <div className="absolute inset-0 bg-linear-to-br from-muted to-muted/80 border-2 border-border/50 rounded-3xl">
                          {/* Window chrome */}
                          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-background/30 backdrop-blur-sm">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-400/60" />
                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/60" />
                            <div className="w-3.5 h-3.5 rounded-full bg-green-400/60" />
                            <div className="flex-1 mx-4">
                              <div className="w-1/2 h-5 rounded-full bg-muted-foreground/10 mx-auto" />
                            </div>
                          </div>
                          {/* Content placeholder */}
                          <div className="flex flex-col items-center justify-center h-[calc(100%-56px)] gap-6">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-full bg-pink/10 flex items-center justify-center border border-pink/20">
                                <feature.icon className="h-12 w-12 text-pink/60" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-pink/90 flex items-center justify-center shadow-lg">
                                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                                </div>
                              </div>
                            </div>
                            <span className="text-muted-foreground/40 text-sm uppercase tracking-widest">
                              Demo video coming soon
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>

          </section>
        ))}
      </div>

      {/* Navigation dots - only visible when feature sections are in view */}
      {isInView && (
        <nav
          className="scroll-nav-dots"
          role="tablist"
          aria-label="Feature sections"
        >
          {/* Intro dot */}
          <button
            onClick={() => scrollToSection(0)}
            className={`scroll-nav-dot ${activeIndex === 0 ? "active" : ""}`}
            role="tab"
            aria-selected={activeIndex === 0}
            aria-label={t("everythingYouNeed")}
            tabIndex={activeIndex === 0 ? 0 : -1}
          >
            <span className="scroll-nav-dot-tooltip">
              {t("everythingYouNeed")}
            </span>
          </button>
          {FEATURE_SHOWCASE.map((feature, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index + 1)}
              className={`scroll-nav-dot ${activeIndex === index + 1 ? "active" : ""}`}
              role="tab"
              aria-selected={activeIndex === index + 1}
              aria-label={t(feature.titleKey)}
              tabIndex={activeIndex === index + 1 ? 0 : -1}
            >
              <span className="scroll-nav-dot-tooltip">
                {t(feature.titleKey)}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Progress line - only visible when feature sections are in view */}
      {isInView && (
        <div
          className="scroll-progress-line"
          style={{
            height: `${((activeIndex + 1) / (FEATURE_SHOWCASE.length + 1)) * 100}%`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

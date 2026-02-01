"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/app/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "blur";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      element.classList.add("scroll-reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class after delay
            setTimeout(() => {
              element.classList.add("scroll-reveal-visible");
            }, delay);

            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            element.classList.remove("scroll-reveal-visible");
          }
        });
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, threshold, once]);

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", `scroll-reveal-${animation}`, className)}
      style={
        {
          "--scroll-reveal-duration": `${duration}ms`,
          "--scroll-reveal-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

// Staggered children reveal - wraps multiple items with increasing delays
interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "blur";
  staggerDelay?: number;
  baseDuration?: number;
  threshold?: number;
}

export function StaggerReveal({
  children,
  className,
  animation = "fade-up",
  staggerDelay = 100,
  baseDuration = 500,
  threshold = 0.1,
}: StaggerRevealProps) {
  return (
    <>
      {children.map((child, index) => (
        <ScrollReveal
          key={index}
          className={className}
          animation={animation}
          delay={index * staggerDelay}
          duration={baseDuration}
          threshold={threshold}
        >
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}

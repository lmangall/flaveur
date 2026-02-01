"use client";

import { useRef } from "react";
import { motion, useMotionValue, useAnimationFrame, useMotionTemplate } from "motion/react";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientProgress = useMotionValue(0);
  const elapsedRef = useRef(0);

  useAnimationFrame((_, delta) => {
    const animationDuration = animationSpeed * 1000;
    elapsedRef.current += delta;
    const progress = (elapsedRef.current % animationDuration) / animationDuration;
    gradientProgress.set(progress * 100);
  });

  const gradientColors = [...colors, colors[0]].join(", ");
  const backgroundPositionX = useMotionTemplate`${gradientProgress}%`;

  return (
    <span
      className={`relative inline-flex ${showBorder ? "rounded-[1.25rem] p-[0.35rem_0.75rem]" : ""} ${className}`}
      style={{
        backdropFilter: showBorder ? "blur(10px)" : undefined,
      }}
    >
      {showBorder && (
        <motion.span
          className="absolute inset-0 z-0 rounded-[1.25rem] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${gradientColors})`,
            backgroundSize: "300% 100%",
            backgroundPositionX,
          }}
        >
          <span
            className="absolute rounded-[calc(1.25rem-1px)] bg-background"
            style={{
              inset: "1px",
            }}
          />
        </motion.span>
      )}
      <motion.span
        className="relative z-10 bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradientColors})`,
          backgroundSize: "300% 100%",
          backgroundPositionX,
          WebkitBackgroundClip: "text",
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

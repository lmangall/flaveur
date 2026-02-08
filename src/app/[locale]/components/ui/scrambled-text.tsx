"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// All same-width block characters for animation without jumping
const CIPHER_CHARS = "█▓▒░■□▪▫●○";

interface ScrambledTextProps {
  children: string;
  className?: string;
  scrambledClassName?: string;
  revealedClassName?: string;
  settledClassName?: string;
  radius?: number;
  revealDuration?: number;
  settleDuration?: number;
}

function getRandomChar(): string {
  return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
}

export function ScrambledText({
  children,
  className,
  scrambledClassName,
  revealedClassName,
  settledClassName,
  radius = 80,
  revealDuration = 1000,
  settleDuration = 600,
}: ScrambledTextProps) {
  const text = children;
  const containerRef = useRef<HTMLSpanElement>(null);
  const charElsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const revealedRef = useRef<Set<number>>(new Set());
  const settledRef = useRef<Set<number>>(new Set());
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const settleTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [tick, setTick] = useState(0);

  // Scramble animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((n) => n + 1);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Pointer move handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: PointerEvent) => {
      let hasChanges = false;

      charElsRef.current.forEach((el, index) => {
        if (!el || text[index] === " ") return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (dist < radius && !revealedRef.current.has(index)) {
          revealedRef.current.add(index);
          // Clear settled state when re-revealed
          settledRef.current.delete(index);
          const existingSettle = settleTimeoutsRef.current.get(index);
          if (existingSettle) clearTimeout(existingSettle);
          hasChanges = true;

          const existing = timeoutsRef.current.get(index);
          if (existing) clearTimeout(existing);

          const timeout = setTimeout(() => {
            // Transition to settled (foreground color) before un-revealing
            settledRef.current.add(index);
            revealedRef.current.delete(index);
            timeoutsRef.current.delete(index);
            setTick((n) => n + 1);

            // After settle duration, go back to scrambled
            const settleTimeout = setTimeout(() => {
              settledRef.current.delete(index);
              settleTimeoutsRef.current.delete(index);
              setTick((n) => n + 1);
            }, settleDuration);
            settleTimeoutsRef.current.set(index, settleTimeout);
          }, revealDuration);
          timeoutsRef.current.set(index, timeout);
        }
      });

      if (hasChanges) setTick((n) => n + 1);
    };

    container.addEventListener("pointermove", handleMove);
    return () => container.removeEventListener("pointermove", handleMove);
  }, [text, radius, revealDuration, settleDuration]);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    const settleTimeouts = settleTimeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      settleTimeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Split text into words (preserving spaces between them)
  const words = text.split(/( +)/);
  let charIndex = 0;

  return (
    <span
      ref={containerRef}
      className={cn("cursor-pointer select-none", className)}
    >
      {words.map((word, wordIdx) => {
        const startIndex = charIndex;
        charIndex += word.length;

        // Pure space segments — render inline to preserve wrapping
        if (/^ +$/.test(word)) {
          return (
            <span key={`w${wordIdx}`}>
              {word.split("").map((_, i) => (
                <span key={startIndex + i}>{" "}</span>
              ))}
            </span>
          );
        }

        // Word segment — wrap in inline-flex so it doesn't break mid-word
        return (
          <span key={`w${wordIdx}`} className="inline-flex">
            {word.split("").map((char, i) => {
              const idx = startIndex + i;
              const isRevealed = revealedRef.current.has(idx);
              const isSettled = settledRef.current.has(idx);
              const displayChar = isRevealed || isSettled ? char : getRandomChar();

              const colorClass = isRevealed
                ? revealedClassName
                : isSettled
                  ? (settledClassName || "text-foreground")
                  : scrambledClassName;

              return (
                <span
                  key={idx}
                  ref={(el) => {
                    charElsRef.current[idx] = el;
                  }}
                  className="relative inline-block"
                >
                  {/* Invisible real char — defines the width */}
                  <span className="invisible">{char}</span>
                  {/* Visible overlay — scrambled, revealed, or settled */}
                  <span
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-300",
                      colorClass
                    )}
                    style={{
                      opacity: isRevealed || isSettled ? 1 : 0.7,
                    }}
                  >
                    {displayChar}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

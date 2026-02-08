"use client";

import { useState, useEffect } from "react";
import { useScramble } from "use-scramble";

interface ScrambleTextProps {
  words: string[];
  className?: string;
  speed?: number;
  scramble?: number;
  pauseDuration?: number; // ms between words
}

export function ScrambleText({
  words,
  className,
  speed = 0.8,
  scramble = 4,
  pauseDuration = 3000,
}: ScrambleTextProps) {
  const [wordIndex, setWordIndex] = useState(0);

  const { ref } = useScramble({
    text: words[wordIndex],
    speed,
    scramble,
    onAnimationEnd: () => {
      // Wait, then cycle to next word
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
      }, pauseDuration);
    },
  });

  return <span ref={ref} className={className} />;
}

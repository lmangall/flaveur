"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number; // ms per character
  deletingSpeed?: number; // ms per character when deleting
  pauseDuration?: number; // ms to pause after typing complete word
}

export function TypewriterText({
  words,
  className,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseDuration = 2000,
}: TypewriterTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (text.length < currentWord.length) {
            setText(currentWord.slice(0, text.length + 1));
          } else {
            // Finished typing, pause then start deleting
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting
          if (text.length > 0) {
            setText(text.slice(0, -1));
          } else {
            // Finished deleting, move to next word
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {text}
      <span className="animate-blink">|</span>
    </span>
  );
}

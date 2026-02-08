"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import ReactConfetti from "react-confetti";

type ConfettiContextType = {
  fire: () => void;
};

const ConfettiContext = createContext<ConfettiContextType | null>(null);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const fire = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 5000);
  }, []);

  return (
    <ConfettiContext.Provider value={{ fire }}>
      {children}
      {isActive && (
        <ReactConfetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={["#FF69B4", "#FF1493", "#FFB6C1", "#FFC0CB", "#FF85A2", "#DB7093"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
        />
      )}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
}

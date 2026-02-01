"use client";

import dynamic from "next/dynamic";

const Waves = dynamic(() => import("@/app/components/Waves"), { ssr: false });

interface WavesBackgroundProps {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  xGap?: number;
  yGap?: number;
}

export function WavesBackground({
  lineColor = "#fbcfe8",
  backgroundColor = "transparent",
  waveSpeedX = 0.04,
  waveSpeedY = 0.06,
  waveAmpX = 15,
  waveAmpY = 20,
  friction = 0.9,
  tension = 0.035,
  maxCursorMove = 60,
  xGap = 10,
  yGap = 18,
}: WavesBackgroundProps) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-auto">
      <Waves
        lineColor={lineColor}
        backgroundColor={backgroundColor}
        waveSpeedX={waveSpeedX}
        waveSpeedY={waveSpeedY}
        waveAmpX={waveAmpX}
        waveAmpY={waveAmpY}
        friction={friction}
        tension={tension}
        maxCursorMove={maxCursorMove}
        xGap={xGap}
        yGap={yGap}
      />
    </div>
  );
}

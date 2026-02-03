"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface SamplesPageTrackerProps {
  sampleCount: number;
  variationsCount: number;
}

export function SamplesPageTracker({
  sampleCount,
  variationsCount,
}: SamplesPageTrackerProps) {
  useEffect(() => {
    posthog.capture("sample_flavor_viewed", {
      sample_count: sampleCount,
      samples_with_variations: variationsCount,
    });
  }, [sampleCount, variationsCount]);

  return null;
}

"use client";

import FlavoringCalculator from "@/app/[locale]/components/FlavoringCalculator";

export default function CalculatorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <div className="container px-4 md:px-6">
        <FlavoringCalculator />
      </div>
    </div>
  );
}

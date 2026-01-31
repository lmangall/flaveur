"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getOnboardingStatus } from "@/actions/onboarding";
import { OnboardingDialog } from "./OnboardingDialog";

export function OnboardingCheck() {
  const { data: session, isPending } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      if (isPending || !session?.user?.id || hasChecked) {
        return;
      }

      try {
        const result = await getOnboardingStatus();
        if (result.needsOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setHasChecked(true);
      }
    }

    checkOnboarding();
  }, [session, isPending, hasChecked]);

  if (!showOnboarding) {
    return null;
  }

  return (
    <OnboardingDialog
      open={showOnboarding}
      onOpenChange={(open) => {
        setShowOnboarding(open);
      }}
    />
  );
}

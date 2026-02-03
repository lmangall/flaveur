"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { trackReferralConversion } from "@/actions/referrals";
import { notifyNewUserSignup } from "@/actions/users";

const REFERRAL_CODE_KEY = "oumamie_referral_code";
const REFERRAL_TRACKED_KEY = "oumamie_referral_tracked";

/**
 * Component that handles referral code tracking.
 * 1. Stores referral code from URL (?ref=XXX) into localStorage
 * 2. When user authenticates, tracks the conversion
 *
 * Should be placed in the root layout to capture referrals site-wide.
 */
export function ReferralTracker() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const hasTracked = useRef(false);

  // Step 1: Store referral code from URL if present
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      // Store the referral code
      localStorage.setItem(REFERRAL_CODE_KEY, refCode);
      // Reset the tracked flag for new referral codes
      localStorage.removeItem(REFERRAL_TRACKED_KEY);
    }
  }, [searchParams]);

  // Step 2: When user authenticates, track the conversion
  useEffect(() => {
    async function trackConversion() {
      // Only track once per session to avoid duplicate API calls
      if (hasTracked.current) return;

      // Check if user is authenticated
      if (!session?.user?.id) return;

      // Check if we already tracked this referral
      const alreadyTracked = localStorage.getItem(REFERRAL_TRACKED_KEY);
      if (alreadyTracked) return;

      // Get the stored referral code
      const referralCode = localStorage.getItem(REFERRAL_CODE_KEY);
      if (!referralCode) return;

      hasTracked.current = true;

      try {
        const result = await trackReferralConversion(referralCode, session.user.id);

        if (result.success) {
          // Mark as tracked to prevent duplicate tracking
          localStorage.setItem(REFERRAL_TRACKED_KEY, "true");
          // Clean up the referral code
          localStorage.removeItem(REFERRAL_CODE_KEY);
          console.log("[ReferralTracker] Referral conversion tracked successfully");

          // Notify admin of new referred user (fire and forget)
          // This handles Google OAuth signups that bypass the sign-up page
          notifyNewUserSignup({
            userId: session.user.id,
            email: session.user.email || "",
            name: session.user.name || session.user.email || "Unknown",
            signupMethod: "google", // Most likely Google if via referral tracker
            referralCode,
          });
        } else {
          // Referral code was invalid or already used
          // Still clean up to prevent repeated attempts
          localStorage.removeItem(REFERRAL_CODE_KEY);
        }
      } catch (error) {
        console.error("[ReferralTracker] Failed to track referral:", error);
        // Reset the flag to allow retry on next page load
        hasTracked.current = false;
      }
    }

    trackConversion();
  }, [session?.user?.id]);

  // This component doesn't render anything
  return null;
}

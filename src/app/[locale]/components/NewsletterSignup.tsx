"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function NewsletterSignup() {
  const t = useTranslations("Home"); // Localized strings for messages and labels
  const [email, setEmail] = useState(""); // Tracks user input
  const [isLoading, setIsLoading] = useState(false); // Indicates form submission status

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior
    setIsLoading(true); // Show loading state

    try {
      // Attempt to send the email to the Google Apps Script endpoint
      await fetch(
        "https://script.google.com/macros/s/AKfycbxoWGdT4DyZBj31zV_2F9xZ7i2Oap5lDZoVXwfbBS7o0d3f21Jwin4UHEK80MI4fqu6/exec",
        {
          method: "POST",
          mode: "no-cors", // Prevent CORS errors by making response opaque
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ email }).toString(), // Format body as URL-encoded
        }
      );

      // Since we can't read the response due to "no-cors", assume it worked
      toast.success(t("subscribeSuccess"));
      setEmail(""); // Reset input field
    } catch {
      // This block only runs if there's a network-level error (e.g., no internet)
      // Even in this case, we show success toast (force success)
      toast.success(t("subscribeSuccess"));
      setEmail(""); // Reset input field
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };

  return (
    <form
      onSubmit={handleSubscribe}
      className="flex w-full max-w-sm flex-col gap-2 min-[400px]:flex-row"
    >
      {/* Email input field */}
      <Input
        type="email"
        placeholder="name@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />

      {/* Submit button with loading state and icon */}
      <Button type="submit" size="lg" variant="secondary" disabled={isLoading}>
        {isLoading ? t("subscribeLoading") : t("getStarted")}
        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function NewsletterSignup() {
  const t = useTranslations("Home");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbyoHonbBsRmyMkwTMsKVP4xZooJNBIrH-eYfM0Rezt7WX5mhINSym6-aMHWSLmkPcs/exec",
        {
          method: "POST",
          mode: "no-cors", // Prevents CORS errors but makes response opaque
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ email }).toString(),
        }
      );

      // Since we can't read the response with no-cors mode, assume success
      // The script is working as confirmed by your testing
      toast.success(t("subscribeSuccess"));
      setEmail("");
    } catch (error) {
      // Only network-level errors (like no internet) will reach here
      console.error("Network error:", error);
      toast.error(
        t("subscribeError") || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubscribe}
      className="flex w-full max-w-sm flex-col gap-2 min-[400px]:flex-row"
    >
      <Input
        type="email"
        placeholder="name@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />

      <Button type="submit" size="lg" variant="secondary" disabled={isLoading}>
        {isLoading ? t("subscribeLoading") : t("getStarted")}
        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

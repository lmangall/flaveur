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
        "https://script.google.com/macros/s/AKfycbxoWGdT4DyZBj31zV_2F9xZ7i2Oap5lDZoVXwfbBS7o0d3f21Jwin4UHEK80MI4fqu6/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ email }).toString(),
        }
      );

      // WARNING:
      // Due to CORS restrictions on Google Apps Script,
      // the browser blocks reading the actual response.
      // Therefore, we optimistically show success toast here,
      // even if the response status is not accessible.
      toast.success(t("subscribeSuccess"));
      setEmail("");
    } catch {
      // This catch block only triggers on network errors,
      // it won't trigger if Google Apps Script returns an error response
      toast.error(t("subscribeError"));
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
        placeholder={t("name@gmail.com")}
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

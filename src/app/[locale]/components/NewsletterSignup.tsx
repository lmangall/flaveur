"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { subscribeToNewsletter } from "@/actions/newsletter";

interface NewsletterSignupProps {
  source?: string;
}

export function NewsletterSignup({ source = "homepage" }: NewsletterSignupProps) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await subscribeToNewsletter(email, source, locale);

      if (result.success) {
        toast.success(t("subscribeSuccess"));
        setEmail("");
      } else {
        if (result.error === "already_subscribed") {
          toast.info(t("alreadySubscribed"));
        } else if (result.error === "invalid_email") {
          toast.error(t("invalidEmail"));
        } else {
          toast.error(t("subscribeError"));
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
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

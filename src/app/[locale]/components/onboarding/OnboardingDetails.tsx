"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

interface OnboardingDetailsProps {
  initialData: {
    bio: string | null;
    organization: string | null;
    location: string | null;
  };
  onSubmit: (data: {
    bio: string | null;
    organization: string | null;
    location: string | null;
  }) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function OnboardingDetails({
  initialData,
  onSubmit,
  onBack,
  onSkip,
  isLoading,
}: OnboardingDetailsProps) {
  const t = useTranslations("Onboarding");
  const [bio, setBio] = useState(initialData.bio || "");
  const [organization, setOrganization] = useState(initialData.organization || "");
  const [location, setLocation] = useState(initialData.location || "");

  const handleSubmit = () => {
    onSubmit({
      bio: bio.trim() || null,
      organization: organization.trim() || null,
      location: location.trim() || null,
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{t("detailsTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("detailsSubtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder={t("bioPlaceholder")}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            placeholder={t("organizationPlaceholder")}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder={t("locationPlaceholder")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
            {t("skip")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

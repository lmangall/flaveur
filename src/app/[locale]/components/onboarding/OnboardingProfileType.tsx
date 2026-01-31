"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { cn } from "@/app/lib/utils";
import { GraduationCap, Briefcase, FlaskConical, BookOpen, ArrowLeft } from "lucide-react";

interface OnboardingProfileTypeProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

const PROFILE_TYPES = [
  {
    value: "student",
    labelKey: "profileTypeStudent",
    descKey: "profileTypeStudentDesc",
    icon: GraduationCap,
  },
  {
    value: "professional",
    labelKey: "profileTypeProfessional",
    descKey: "profileTypeProfessionalDesc",
    icon: Briefcase,
  },
  {
    value: "hobbyist",
    labelKey: "profileTypeHobbyist",
    descKey: "profileTypeHobbyistDesc",
    icon: FlaskConical,
  },
  {
    value: "educator",
    labelKey: "profileTypeEducator",
    descKey: "profileTypeEducatorDesc",
    icon: BookOpen,
  },
] as const;

export function OnboardingProfileType({
  selectedType,
  onSelect,
  onBack,
  onSkip,
  isLoading,
}: OnboardingProfileTypeProps) {
  const t = useTranslations("Onboarding");

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{t("profileTypeTitle")}</h2>
      </div>

      <div className="grid gap-3">
        {PROFILE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;

          return (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                "hover:border-primary hover:bg-primary/5",
                isSelected && "border-primary bg-primary/10",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{t(type.labelKey)}</p>
                <p className="text-sm text-muted-foreground">{t(type.descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}

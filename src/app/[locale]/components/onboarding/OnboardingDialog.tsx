"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
} from "@/app/[locale]/components/ui/dialog";
import { Progress } from "@/app/[locale]/components/ui/progress";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { OnboardingProfileType } from "./OnboardingProfileType";
import { OnboardingDetails } from "./OnboardingDetails";
import { OnboardingComplete } from "./OnboardingComplete";
import {
  saveOnboardingProgress,
  completeOnboarding,
  skipOnboarding,
  type OnboardingData,
} from "@/actions/onboarding";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 4;

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const t = useTranslations("Onboarding");
  const { fire: fireConfetti } = useConfetti();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    profile_type: null,
    bio: null,
    organization: null,
    location: null,
  });

  const progressValue = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await skipOnboarding();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileTypeSelect = async (profileType: string) => {
    const newData = { ...formData, profile_type: profileType };
    setFormData(newData);
    // Save progress
    await saveOnboardingProgress({ profile_type: profileType });
    handleNext();
  };

  const handleDetailsSubmit = async (details: {
    bio: string | null;
    organization: string | null;
    location: string | null;
  }) => {
    const newData = { ...formData, ...details };
    setFormData(newData);
    // Complete onboarding
    setIsLoading(true);
    try {
      await completeOnboarding(newData);
      handleNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    fireConfetti();
    onOpenChange(false);
  };

  // Fire confetti when reaching the complete step
  useEffect(() => {
    if (currentStep === 3) {
      fireConfetti();
    }
  }, [currentStep, fireConfetti]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingWelcome
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <OnboardingProfileType
            selectedType={formData.profile_type}
            onSelect={handleProfileTypeSelect}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <OnboardingDetails
            initialData={{
              bio: formData.bio,
              organization: formData.organization,
              location: formData.location,
            }}
            onSubmit={handleDetailsSubmit}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 3:
        return <OnboardingComplete onFinish={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="mb-4">
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("progressStep", { current: currentStep + 1, total: TOTAL_STEPS })}
          </p>
        </div>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

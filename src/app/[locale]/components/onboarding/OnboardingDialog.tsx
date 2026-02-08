"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
} from "@/app/[locale]/components/ui/dialog";
import { Progress } from "@/app/[locale]/components/ui/progress";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { OnboardingFeature } from "./OnboardingFeature";
import { OnboardingComplete } from "./OnboardingComplete";
import { completeOnboarding, skipOnboarding } from "@/actions/onboarding";
import {
  FlaskConical,
  Beaker,
  TestTube2,
  Sparkles,
  Brain,
  Target,
  Trophy,
  Users,
  FolderOpen,
  Share2,
} from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 5;

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const locale = useLocale();
  const { fire: fireConfetti } = useConfetti();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        profile_type: null,
        bio: null,
        organization: null,
        location: null,
      });
      fireConfetti();
      onOpenChange(false);
      router.push(`/${locale}/dashboard`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fire confetti when reaching the complete step
  useEffect(() => {
    if (currentStep === TOTAL_STEPS - 1) {
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
        // Feature: Formula Formulas
        return (
          <OnboardingFeature
            icon={FlaskConical}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            titleKey="featureFormulasTitle"
            descriptionKey="featureFormulasDesc"
            highlights={[
              { icon: Beaker, textKey: "featureFormulasHighlight1" },
              { icon: TestTube2, textKey: "featureFormulasHighlight2" },
              { icon: Sparkles, textKey: "featureFormulasHighlight3" },
            ]}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 2:
        // Feature: Substance Learning
        return (
          <OnboardingFeature
            icon={Brain}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            titleKey="featureLearningTitle"
            descriptionKey="featureLearningDesc"
            highlights={[
              { icon: Target, textKey: "featureLearningHighlight1" },
              { icon: Trophy, textKey: "featureLearningHighlight2" },
              { icon: Sparkles, textKey: "featureLearningHighlight3" },
            ]}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 3:
        // Feature: Workspaces
        return (
          <OnboardingFeature
            icon={Users}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            titleKey="featureWorkspacesTitle"
            descriptionKey="featureWorkspacesDesc"
            highlights={[
              { icon: FolderOpen, textKey: "featureWorkspacesHighlight1" },
              { icon: Share2, textKey: "featureWorkspacesHighlight2" },
              { icon: Users, textKey: "featureWorkspacesHighlight3" },
            ]}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 4:
        return <OnboardingComplete onFinish={handleComplete} isLoading={isLoading} />;
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

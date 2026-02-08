"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
} from "@/app/[locale]/components/ui/dialog";
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
        return (
          <OnboardingFeature
            icon={FlaskConical}
            accentHue={330}
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
        return (
          <OnboardingFeature
            icon={Brain}
            accentHue={340}
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
        return (
          <OnboardingFeature
            icon={Users}
            accentHue={320}
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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl shadow-pink/20 dark:shadow-pink/10">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-muted via-background to-background dark:from-pink-muted/20 dark:via-background" />

        {/* Animated gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-pink/30 to-pink/5 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-tr from-pink/20 to-transparent blur-2xl animate-pulse-glow delay-500" />

        {/* Content */}
        <div className="relative z-10 p-6 pt-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index >= currentStep}
                  className={`
                    h-1.5 rounded-full transition-all duration-500 ease-out
                    ${index === currentStep
                      ? "w-8 bg-gradient-to-r from-pink to-pink/80 shadow-lg shadow-pink/30"
                      : index < currentStep
                        ? "w-1.5 bg-pink/60 hover:bg-pink/80 cursor-pointer"
                        : "w-1.5 bg-muted-foreground/20"
                    }
                  `}
                  aria-label={`Step ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 text-center font-medium tracking-wide">
              {t("progressStep", { current: currentStep + 1, total: TOTAL_STEPS })}
            </p>
          </div>
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

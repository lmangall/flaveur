"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, HelpCircle, LucideIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";

export interface HowItWorksStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface HowItWorksTip {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksProps {
  title: string;
  steps: HowItWorksStep[];
  tip?: HowItWorksTip;
  defaultOpen?: boolean;
  className?: string;
  faqLink?: {
    text: string;
    category?: string;
  };
}

export function HowItWorks({
  title,
  steps,
  tip,
  defaultOpen = false,
  className = "",
  faqLink,
}: HowItWorksProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const locale = useLocale();

  const faqUrl = faqLink?.category
    ? `/${locale}/faq#${faqLink.category}`
    : `/${locale}/faq`;

  return (
    <Card className={className}>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index}>
                  <h4 className="font-medium mb-1 flex items-center gap-1.5">
                    <StepIcon className="h-4 w-4 text-primary shrink-0" />
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
          {tip && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <tip.icon className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{tip.title}</span>{" "}
                {tip.description}
              </p>
            </div>
          )}
          {faqLink && (
            <div className="mt-4 pt-4 border-t">
              <Link
                href={faqUrl}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {faqLink.text}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

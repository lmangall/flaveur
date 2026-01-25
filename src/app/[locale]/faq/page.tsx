import { Metadata } from "next";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/[locale]/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ",
    description: "Frequently asked questions about Oumamie",
  };
}

type FAQItem = {
  questionKey: string;
  answerKey: string;
};

const faqItems: FAQItem[] = [
  { questionKey: "sharingQuestion", answerKey: "sharingAnswer" },
  { questionKey: "editSharedQuestion", answerKey: "editSharedAnswer" },
  { questionKey: "duplicateQuestion", answerKey: "duplicateAnswer" },
  { questionKey: "revokeQuestion", answerKey: "revokeAnswer" },
  { questionKey: "freeQuestion", answerKey: "freeAnswer" },
  { questionKey: "dataQuestion", answerKey: "dataAnswer" },
  { questionKey: "regulatoryDataQuestion", answerKey: "regulatoryDataAnswer" },
  {
    questionKey: "additiveVsFlavouringQuestion",
    answerKey: "additiveVsFlavouringAnswer",
  },
  {
    questionKey: "contributeSubstanceQuestion",
    answerKey: "contributeSubstanceAnswer",
  },
  { questionKey: "feedbackQuestion", answerKey: "feedbackAnswer" },
  {
    questionKey: "contributionProcessQuestion",
    answerKey: "contributionProcessAnswer",
  },
];

export default function FAQ() {
  const t = useTranslations("FAQ");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("subtitle")}</p>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.questionKey} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {t(item.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(item.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

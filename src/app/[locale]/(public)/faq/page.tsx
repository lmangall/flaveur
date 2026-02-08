"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/[locale]/components/ui/accordion";

type FAQItem = {
  questionKey: string;
  answerKey: string;
  hasCustomRender?: boolean;
};

type FAQCategory = {
  titleKey: string;
  items: FAQItem[];
};

const faqCategories: FAQCategory[] = [
  {
    titleKey: "categoryGeneral",
    items: [
      { questionKey: "freeQuestion", answerKey: "freeAnswer" },
      { questionKey: "dataQuestion", answerKey: "dataAnswer" },
    ],
  },
  {
    titleKey: "categorySharing",
    items: [
      { questionKey: "sharingQuestion", answerKey: "sharingAnswer" },
      { questionKey: "editSharedQuestion", answerKey: "editSharedAnswer" },
      { questionKey: "duplicateQuestion", answerKey: "duplicateAnswer" },
      { questionKey: "revokeQuestion", answerKey: "revokeAnswer" },
    ],
  },
  {
    titleKey: "categoryImport",
    items: [
      { questionKey: "importQuestion", answerKey: "importAnswer", hasCustomRender: true },
    ],
  },
  {
    titleKey: "categoryRegulatory",
    items: [
      { questionKey: "regulatoryDataQuestion", answerKey: "regulatoryDataAnswer" },
      { questionKey: "additiveVsFormulaingQuestion", answerKey: "additiveVsFormulaingAnswer" },
    ],
  },
  {
    titleKey: "categoryContributions",
    items: [
      { questionKey: "contributeSubstanceQuestion", answerKey: "contributeSubstanceAnswer" },
      { questionKey: "feedbackQuestion", answerKey: "feedbackAnswer" },
      { questionKey: "contributionProcessQuestion", answerKey: "contributionProcessAnswer" },
    ],
  },
];

const WHATSAPP_NUMBER = "48537606403";
const EMAIL = "l.mangallon@gmail.com";

function ImportAnswer({ t }: { t: (key: string) => string }) {
  const handleWhatsAppClick = () => {
    const message = t("importWhatsAppMessage");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <span>
      {t("importAnswerBase")}{" "}
      <a
        href={`mailto:${EMAIL}`}
        className="text-primary underline hover:text-primary/80"
      >
        {t("importAnswerEmail")}
      </a>{" "}
      {t("importAnswerOr")}{" "}
      <button
        onClick={handleWhatsAppClick}
        className="text-primary underline hover:text-primary/80"
      >
        WhatsApp
      </button>
      {" "}{t("importAnswerEnd")}
    </span>
  );
}

export default function FAQ() {
  const t = useTranslations("FAQ");

  const renderAnswer = (item: FAQItem) => {
    if (item.hasCustomRender && item.questionKey === "importQuestion") {
      return <ImportAnswer t={t} />;
    }
    return t(item.answerKey);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("subtitle")}</p>

        <div className="space-y-8">
          {faqCategories.map((category) => (
            <div key={category.titleKey}>
              <h2 className="text-xl font-semibold mb-4">{t(category.titleKey)}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem key={item.questionKey} value={`${category.titleKey}-${index}`}>
                    <AccordionTrigger className="text-left">
                      {t(item.questionKey)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {renderAnswer(item)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

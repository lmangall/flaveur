import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { IngredientsExplorer } from "./IngredientsExplorer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cosmetic Ingredients Encyclopedia",
    description:
      "A reference guide to 138 cosmetic raw materials across 20 categories — emulsifiers, oils, pigments, UV filters, and more.",
  };
}

export default async function IngredientsPage() {
  const t = await getTranslations("IngredientsEncyclopedia");

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <IngredientsExplorer />
    </PageContainer>
  );
}

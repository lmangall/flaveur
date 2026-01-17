import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";
import { Mail } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description:
      "Learn more about Oumamie and our mission to revolutionize flavor creation.",
  };
}

export default function About() {
  const t = useTranslations("About");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

        <div className="prose prose-lg mb-12">
          <p className="mb-6">{t("mainText")}</p>
          <p className="mb-6">{t("mainText2")}</p>
          <p className="mb-6">{t("mainText3")}</p>
          <a
            href="mailto:l.mangallon@gmail.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Mail className="h-5 w-5" />
            {t("contactUs")}
          </a>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("features")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 text-left border">{t("status")}</th>
                  <th className="p-4 text-left border">{t("feature")}</th>
                  <th className="p-4 text-left border">{t("description")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {t("implemented")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">{t("substanceDb")}</td>
                  <td className="p-4 border">{t("substanceDbDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {t("implemented")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">{t("searchDb")}</td>
                  <td className="p-4 border">{t("searchDbDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {t("implemented")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">
                    {t("flavorCreation")}
                  </td>
                  <td className="p-4 border">{t("flavorCreationDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {t("implemented")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">{t("jobBoard")}</td>
                  <td className="p-4 border">{t("jobBoardDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {t("comingSoon")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">{t("ai")}</td>
                  <td className="p-4 border">{t("aiDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {t("comingSoon")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">
                    {t("quantityCalculator")}
                  </td>
                  <td className="p-4 border">{t("quantityCalculatorDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {t("comingSoon")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">
                    {t("portfolioExport")}
                  </td>
                  <td className="p-4 border">{t("portfolioExportDesc")}</td>
                </tr>
                <tr>
                  <td className="p-4 border">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {t("comingSoon")}
                    </span>
                  </td>
                  <td className="p-4 border font-medium">{t("radarChart")}</td>
                  <td className="p-4 border">{t("radarChartDesc")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-8 rounded-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              {t("NewsletterTitle")}
            </h2>
            <p className="text-lg mb-6 text-primary-foreground/90">
              {t("NewsletterDescription")}
            </p>
            <div className="flex justify-center">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/app/[locale]/components/NewsletterSignup";
import {
  Mail,
  Database,
  Search,
  FlaskConical,
  Briefcase,
  Calculator,
  Bot,
  FileDown,
  PieChart,
  ArrowRight,
  Share2,
  Atom,
  ShieldCheck,
  Bell,
  GitPullRequestCreate,
} from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description:
      "Learn more about Oumamie and our mission to revolutionize flavor creation.",
  };
}

type FeatureItem = {
  key: string;
  descKey: string;
  icon: React.ReactNode;
  implemented: boolean;
  href?: string;
};

const features: FeatureItem[] = [
  {
    key: "substanceDb",
    descKey: "substanceDbDesc",
    icon: <Database className="h-5 w-5" />,
    implemented: true,
    href: "/substances",
  },
  {
    key: "searchDb",
    descKey: "searchDbDesc",
    icon: <Search className="h-5 w-5" />,
    implemented: true,
    href: "/substances",
  },
  {
    key: "flavorCreation",
    descKey: "flavorCreationDesc",
    icon: <FlaskConical className="h-5 w-5" />,
    implemented: true,
    href: "/flavours",
  },
  {
    key: "sharing",
    descKey: "sharingDesc",
    icon: <Share2 className="h-5 w-5" />,
    implemented: true,
    href: "/flavours",
  },
  {
    key: "radarChart",
    descKey: "radarChartDesc",
    icon: <PieChart className="h-5 w-5" />,
    implemented: true,
    href: "/flavours",
  },
  {
    key: "moleculeViewer",
    descKey: "moleculeViewerDesc",
    icon: <Atom className="h-5 w-5" />,
    implemented: true,
    href: "/molecules",
  },
  {
    key: "euCompliance",
    descKey: "euComplianceDesc",
    icon: <ShieldCheck className="h-5 w-5" />,
    implemented: true,
    href: "/flavours",
  },
  {
    key: "contributions",
    descKey: "contributionsDesc",
    icon: <GitPullRequestCreate className="h-5 w-5" />,
    implemented: true,
    href: "/contribute",
  },
  {
    key: "jobBoard",
    descKey: "jobBoardDesc",
    icon: <Briefcase className="h-5 w-5" />,
    implemented: true,
    href: "/jobs",
  },
  {
    key: "jobAlerts",
    descKey: "jobAlertsDesc",
    icon: <Bell className="h-5 w-5" />,
    implemented: true,
    href: "/settings",
  },
  {
    key: "quantityCalculator",
    descKey: "quantityCalculatorDesc",
    icon: <Calculator className="h-5 w-5" />,
    implemented: true,
    href: "/calculator",
  },
  {
    key: "ai",
    descKey: "aiDesc",
    icon: <Bot className="h-5 w-5" />,
    implemented: false,
  },
  {
    key: "portfolioExport",
    descKey: "portfolioExportDesc",
    icon: <FileDown className="h-5 w-5" />,
    implemented: false,
  },
];

export default function About() {
  const t = useTranslations("About");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

        <div className="prose prose-lg dark:prose-invert mb-12">
          <p className="mb-6 text-muted-foreground">{t("mainText")}</p>
          <p className="mb-6 text-muted-foreground">{t("mainText2")}</p>
          <p className="mb-6 text-muted-foreground">{t("mainText3")}</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="relative rounded-lg border p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-full p-2 ${feature.implemented ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{t(feature.key)}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          feature.implemented
                            ? "bg-green-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {feature.implemented
                          ? t("implemented")
                          : t("comingSoon")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(feature.descKey)}
                    </p>
                    {feature.href && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={feature.href}>
                          {t("tryIt")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

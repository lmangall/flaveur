import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Flavor Composition App. {t("allRightsReserved")}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("privacyPolicy")}
          </Link>
          <Link
            href="/terms-of-service"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("termsOfService")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

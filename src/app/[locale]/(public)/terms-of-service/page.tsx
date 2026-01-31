"use client";

import { useTranslations } from "next-intl";

export default function TermsOfService() {
  const t = useTranslations("terms");

  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("acceptance.title")}
          </h2>
          <p className="text-muted-foreground">{t("acceptance.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("userAccounts.title")}
          </h2>
          <p className="text-muted-foreground">{t("userAccounts.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("intellectualProperty.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("intellectualProperty.content")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("userContent.title")}
          </h2>
          <p className="text-muted-foreground">{t("userContent.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("termination.title")}
          </h2>
          <p className="text-muted-foreground">{t("termination.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("liability.title")}
          </h2>
          <p className="text-muted-foreground">{t("liability.content")}</p>
        </section>
      </div>
    </div>
  );
}

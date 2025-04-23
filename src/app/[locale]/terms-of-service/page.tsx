"use client";

import { useTranslations } from "next-intl";

export default function TermsOfService() {
  const t = useTranslations("terms");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("acceptance.title")}
          </h2>
          <p className="text-muted-foreground">{t("acceptance.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("use.title")}</h2>
          <p className="text-muted-foreground">{t("use.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("content.title")}</h2>
          <p className="text-muted-foreground">{t("content.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("liability.title")}
          </h2>
          <p className="text-muted-foreground">{t("liability.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("changes.title")}</h2>
          <p className="text-muted-foreground">{t("changes.content")}</p>
        </section>
      </div>
    </div>
  );
}

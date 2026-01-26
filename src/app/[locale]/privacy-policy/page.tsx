"use client";

import { useTranslations } from "next-intl";

export default function PrivacyPolicy() {
  const t = useTranslations("privacy");

  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("dataCollection.title")}
          </h2>
          <p className="text-muted-foreground">{t("dataCollection.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("dataUse.title")}</h2>
          <p className="text-muted-foreground">{t("dataUse.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("dataSecurity.title")}
          </h2>
          <p className="text-muted-foreground">{t("dataSecurity.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("cookies.title")}</h2>
          <p className="text-muted-foreground">{t("cookies.content")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
          <p className="text-muted-foreground">{t("contact.content")}</p>
        </section>
      </div>
    </div>
  );
}

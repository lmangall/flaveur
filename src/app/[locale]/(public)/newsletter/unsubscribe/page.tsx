import { unsubscribe } from "@/actions/newsletter";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";

interface Props {
  searchParams: Promise<{ token?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function UnsubscribeNewsletterPage({ searchParams, params }: Props) {
  const { token } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations("Newsletter");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("invalidLink")}</h1>
          <p className="text-muted-foreground mb-6">{t("invalidLinkDescription")}</p>
          <Link href={`/${locale}`}>
            <Button>{t("backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const result = await unsubscribe(token);

  if (result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("unsubscribeSuccess")}</h1>
          <p className="text-muted-foreground mb-6">{t("unsubscribeSuccessDescription")}</p>
          <Link href={`/${locale}`}>
            <Button>{t("backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle different error cases
  let title = t("unsubscribeError");
  let description = t("unsubscribeErrorDescription");

  if (result.error === "already_unsubscribed") {
    title = t("alreadyUnsubscribed");
    description = t("alreadyUnsubscribedDescription");
  } else if (result.error === "token_not_found") {
    title = t("invalidLink");
    description = t("invalidLinkDescription");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Link href={`/${locale}`}>
          <Button>{t("backToHome")}</Button>
        </Link>
      </div>
    </div>
  );
}

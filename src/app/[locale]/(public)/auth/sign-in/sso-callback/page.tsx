import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Better Auth handles OAuth callbacks differently, so this page just redirects to home
export default async function SSOCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to the locale-prefixed home page
  redirect(`/${locale || routing.defaultLocale}`);
}

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-server";
import { AppLayoutClient } from "./layout-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  // Server-side auth check - redirect before rendering
  if (!session?.user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  return <AppLayoutClient>{children}</AppLayoutClient>;
}

import type { ReactNode } from "react";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/app/[locale]/components/ui/sonner";
import Navbar from "@/app/[locale]/components/navbar";
import Footer from "@/app/[locale]/components/footer";
import { Mona_Sans as FontSans } from "next/font/google";
import { TooltipProvider } from "@/app/[locale]/components/ui/tooltip";
import { cn } from "src/app/lib/utils";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flavor Composition App",
  description: "Create and manage flavor compositions",
};

type TranslationValue = string | { [key: string]: TranslationValue };
type Messages = { [key: string]: TranslationValue };

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale(); // Get the locale from the server
  let messages;

  const messagesMap: Record<string, () => Promise<{ default: Messages }>> = {
    en: () => import("../../locales/en.json"),
    fr: () => import("../../locales/fr.json"),
  };

  try {
    messages = messagesMap[locale] ? (await messagesMap[locale]()).default : {};
  } catch (error) {
    console.error(`Could not load translations for locale "${locale}":`, error);
    messages = {};
  }

  return (
    <ClerkProvider>
      <TooltipProvider>
        <html lang={locale}>
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable
            )}
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Navbar />
              <div className="flex-1 px-4 md:px-8 py-8 pt-20 min-h-screen">
                {children}
              </div>
              <Footer />
              <Toaster />
            </NextIntlClientProvider>
          </body>
        </html>
      </TooltipProvider>
    </ClerkProvider>
  );
}

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
  title: {
    default: "Flavor Composition App",
    template: "%s | Flavor Composition App",
  },
  description:
    "Create and manage flavor compositions. The ultimate platform for aspiring flavor scientists to learn, create, and showcase their expertise.",
  keywords: [
    "flavor",
    "composition",
    "flavor science",
    "flavor creation",
    "flavor development",
    "flavor portfolio",
  ],
  authors: [{ name: "Oumamie Team" }],
  creator: "Oumamie Team",
  publisher: "Oumamie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("http://oumamie.xyz/"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      fr: "/fr",
    },
  },
  openGraph: {
    title: "Flavor Composition App",
    description:
      "Create and manage flavor compositions. The ultimate platform for aspiring flavorists.",
    url: "https://Oumamie.com",
    siteName: "Oumamie",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Oumamie - Flavor Composition Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Composition App",
    description:
      "Create and manage flavor compositions. The ultimate platform for aspiring flavor scientists.",
    images: ["/twitter-image.jpg"],
    creator: "@Oumamie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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

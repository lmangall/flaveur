import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Suspense } from "react";
import "@/app/globals.css";
import { Toaster } from "@/app/[locale]/components/ui/sonner";
import { ConfettiProvider } from "@/app/[locale]/components/ui/confetti";
import { OnboardingCheck } from "@/app/[locale]/components/onboarding";
import { ReferralTracker } from "@/app/[locale]/components/referral-tracker";
import { Mona_Sans as FontSans } from "next/font/google";
import { TooltipProvider } from "@/app/[locale]/components/ui/tooltip";
import { cn } from "src/app/lib/utils";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { ImpersonateToolbar } from "@/components/dev/impersonate-toolbar";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    default: "Votre laboratoire d'arômes",
    template: "%s | Votre laboratoire d'arômes",
  },
  description:
    "De l'apprentissage à la création. Pour aromaticiens en formation ou confirmés.",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oumamie",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
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
    title: "Votre laboratoire d'arômes",
    description:
      "Pour aromaticiens en formation ou confirmés.",
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
    title: "Votre laboratoire d'arômes",
    description:
      "De l'apprentissage à la création. Pour aromaticiens en formation ou confirmés.",
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

export const viewport: Viewport = {
  themeColor: "#8B4513",
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
    <TooltipProvider>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ConfettiProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Skip to main content
                </a>
                <OnboardingCheck />
                <Suspense fallback={null}>
                  <ReferralTracker />
                </Suspense>
                {children}
                <Toaster />
                {process.env.NODE_ENV === "development" && <ImpersonateToolbar />}
              </ConfettiProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </TooltipProvider>
  );
}

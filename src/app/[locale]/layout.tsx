import type { ReactNode } from "react";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/app/[locale]/components/ui/sonner";
import Navbar from "@/app/[locale]/components/navbar";
import { Mona_Sans as FontSans } from "next/font/google";
import { TooltipProvider } from "@/app/[locale]/components/ui/tooltip";
import { cn } from "src/app/lib/utils";
import { getLocale } from "next-intl/server";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flavor Composition App",
  description: "Create and manage flavor compositions",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale(); // Get the locale from the server

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
            <Navbar />
            <div className="flex-1 px-4 md:px-8 py-8 pt-20 min-h-screen">
              {children}
            </div>
            <Toaster />
          </body>
        </html>
      </TooltipProvider>
    </ClerkProvider>
  );
}

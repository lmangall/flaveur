import type React from "react";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { Mona_Sans as FontSans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "src/app/lib/utils";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Flavor Composition App",
  description: "Create and manage flavor compositions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TooltipProvider>
        <html lang="en">
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

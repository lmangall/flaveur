import Footer from "@/app/[locale]/components/footer";
import { SupportChatWidget } from "@/app/[locale]/components/support/SupportChatWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main-content" className="flex-1 min-h-screen">
        {children}
      </main>
      <Footer />
      <SupportChatWidget />
    </>
  );
}

import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  const locale = await getLocale();

  if (!admin) {
    redirect(`/${locale}`);
  }

  // Admin navigation is now handled by the main AppSidebar
  return <div className="p-6 max-w-6xl">{children}</div>;
}

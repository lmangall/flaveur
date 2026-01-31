import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getLocale } from "next-intl/server";
import { Briefcase, LayoutDashboard, Database, MessageCircle } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4 hidden md:block">
        <nav className="space-y-2">
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={`/${locale}/admin/jobs`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Jobs
          </Link>
          <Link
            href={`/${locale}/admin/data-quality`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Database className="h-4 w-4" />
            Data Quality
          </Link>
          <Link
            href={`/${locale}/admin/support`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Support
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 max-w-6xl">{children}</div>
    </div>
  );
}

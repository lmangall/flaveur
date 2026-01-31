import { AppLayoutClient } from "./layout-client";

// Auth is handled by middleware - no need to check here
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}

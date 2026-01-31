import { getAdminConversations, getUnreadConversationCount } from "@/actions/support";
import { Card, CardContent } from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[locale]/components/ui/tabs";
import { getLocale } from "next-intl/server";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { ConversationTableClient } from "./ConversationTableClient";

// Simple relative time formatter
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function AdminSupportPage() {
  const locale = await getLocale();
  const [allConversations, unreadCount] = await Promise.all([
    getAdminConversations(),
    getUnreadConversationCount(),
  ]);

  const openConversations = allConversations.filter((c) => c.status === "open");
  const closedConversations = allConversations.filter((c) => c.status === "closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Conversations</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Open ({openConversations.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Closed ({closedConversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <ConversationTableClient conversations={openConversations} locale={locale} />
        </TabsContent>

        <TabsContent value="closed">
          <ConversationTableClient conversations={closedConversations} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

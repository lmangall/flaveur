"use client";

import { useRouter } from "next/navigation";
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
import { MessageCircle } from "lucide-react";
import type { getAdminConversations } from "@/actions/support";

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

export function ConversationTableClient({
  conversations,
  locale,
}: {
  conversations: Awaited<ReturnType<typeof getAdminConversations>>;
  locale: string;
}) {
  const router = useRouter();

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No conversations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.map((conv) => (
            <TableRow
              key={conv.conversation_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/${locale}/admin/support/${conv.conversation_id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {conv.has_unread_admin && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {conv.user_name || conv.guest_email || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.user_email || (conv.user_id ? "Registered User" : "Guest")}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{conv.subject || "General inquiry"}</TableCell>
              <TableCell>
                <Badge variant={conv.status === "open" ? "default" : "secondary"}>
                  {conv.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {conv.updated_at ? formatRelativeTime(conv.updated_at) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

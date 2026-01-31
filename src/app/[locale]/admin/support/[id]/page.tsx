"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/app/[locale]/components/ui/card";
import { Button } from "@/app/[locale]/components/ui/button";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { ScrollArea } from "@/app/[locale]/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import {
  getAdminConversationDetail,
  sendAdminReply,
  updateConversationStatus,
  pollMessages,
  type SupportMessage,
} from "@/actions/support";
import { Send, User, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export default function AdminConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const conversationId = Number(params.id);

  const [conversation, setConversation] = useState<{
    conversation_id: number;
    user_id: string | null;
    guest_email: string | null;
    subject: string | null;
    status: string;
    created_at: string | null;
    updated_at: string | null;
  } | null>(null);
  const [user, setUser] = useState<{ email: string | null; name: string | null } | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversation
  useEffect(() => {
    async function loadConversation() {
      setIsLoading(true);
      const result = await getAdminConversationDetail(conversationId);
      if (result.success) {
        setConversation(result.conversation!);
        setUser(result.user!);
        setMessages(result.messages || []);
      } else {
        toast.error("Failed to load conversation");
        router.push(`/${locale}/admin/support`);
      }
      setIsLoading(false);
    }
    loadConversation();
  }, [conversationId, router, locale]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const lastMessageId = messages[messages.length - 1].message_id;

    pollIntervalRef.current = setInterval(async () => {
      const result = await pollMessages(conversationId, lastMessageId);
      if (result.success && result.messages && result.messages.length > 0) {
        setMessages((prev) => [...prev, ...result.messages!]);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [conversationId, messages]);

  async function handleSendReply() {
    if (!replyContent.trim() || isSending) return;

    setIsSending(true);
    const result = await sendAdminReply(conversationId, replyContent.trim());
    if (result.success && result.message) {
      setMessages((prev) => [...prev, result.message]);
      setReplyContent("");
      toast.success("Reply sent");
    } else {
      toast.error("Failed to send reply");
    }
    setIsSending(false);
  }

  async function handleStatusChange(newStatus: string) {
    setIsUpdatingStatus(true);
    const result = await updateConversationStatus(
      conversationId,
      newStatus as "open" | "closed" | "pending"
    );
    if (result.success) {
      setConversation((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error("Failed to update status");
    }
    setIsUpdatingStatus(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Conversation not found</p>
        <Link href={`/${locale}/admin/support`} className="text-primary hover:underline mt-4 block">
          Back to conversations
        </Link>
      </div>
    );
  }

  const contactName = user?.name || conversation.guest_email || "Unknown";
  const contactEmail = user?.email || conversation.guest_email;
  const isGuest = !conversation.user_id;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={`/${locale}/admin/support`}
            className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{contactName}</h1>
            <p className="text-muted-foreground">
              {contactEmail}
              {isGuest && (
                <Badge variant="outline" className="ml-2">
                  Guest
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={conversation.status}
            onValueChange={handleStatusChange}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <Card className="h-[500px] flex flex-col">
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No messages in this conversation
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={cn(
                    "flex gap-3",
                    msg.sender_type === "admin" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      msg.sender_type === "admin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.sender_type === "admin" ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      msg.sender_type === "admin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-2",
                        msg.sender_type === "admin"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {new Date(msg.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Reply input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <Button
              onClick={handleSendReply}
              disabled={isSending || !replyContent.trim()}
              className="self-end"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Cmd+Enter to send</p>
        </div>
      </Card>
    </div>
  );
}

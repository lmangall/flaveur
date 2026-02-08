"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Minimize2, Send, Loader2, User, Shield } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Card } from "@/app/[locale]/components/ui/card";
import { ScrollArea } from "@/app/[locale]/components/ui/scroll-area";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSupportChat } from "./useSupportChat";
import { useTranslations } from "next-intl";

export function SupportChatWidget() {
  const t = useTranslations("support");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show popup after 3 seconds if chat hasn't been opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowPopup(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Hide popup when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowPopup(false);
    }
  }, [isOpen]);

  const {
    messages,
    sendMessage,
    isLoading,
    isSending,
    error,
    isInitialized,
    adminIsTyping,
    setTyping,
    ensureConversation,
  } = useSupportChat();

  // Create conversation when chat is opened (lazy initialization)
  useEffect(() => {
    if (isOpen && isInitialized) {
      ensureConversation();
    }
  }, [isOpen, isInitialized, ensureConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;
    setTyping(false); // Stop typing indicator when sending
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Button - always visible when chat is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
          {/* Popup message */}
          {showPopup && (
            <div
              className="bg-card border rounded-lg shadow-lg p-3 max-w-[200px] animate-in slide-in-from-right-2 fade-in duration-300"
              onClick={() => setShowPopup(false)}
            >
              <button
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(false);
                }}
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-sm">{t("popupMessage")}</p>
            </div>
          )}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
            size="icon"
            aria-label={t("openChat")}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden",
            isMinimized ? "h-14 w-80" : "h-[500px] w-[380px] max-h-[80vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground shrink-0">
            <span className="font-semibold">{t("title")}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? t("expand") : t("minimize")}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsOpen(false)}
                aria-label={t("close")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content - hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Loading state */}
              {!isInitialized || isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Messages area */}
                  <ScrollArea className="flex-1">
                    <div ref={scrollRef} className="p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>{t("noMessages")}</p>
                          <p className="text-xs mt-1">{t("sendFirst")}</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.message_id}
                            className={cn(
                              "flex gap-2",
                              msg.sender_type === "admin" ? "flex-row" : "flex-row-reverse"
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
                                "max-w-[75%] rounded-lg p-3",
                                msg.sender_type === "admin"
                                  ? "bg-muted"
                                  : "bg-primary text-primary-foreground"
                              )}
                            >
                              <p className="whitespace-pre-wrap text-sm break-words">
                                {msg.content}
                              </p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  msg.sender_type === "admin"
                                    ? "text-muted-foreground"
                                    : "text-primary-foreground/70"
                                )}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Error message */}
                  {error && (
                    <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {/* Typing indicator */}
                  {adminIsTyping && (
                    <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      {t("adminTyping")}
                    </div>
                  )}

                  {/* Input area */}
                  <div className="p-4 border-t shrink-0">
                    <div className="flex gap-2">
                      <Textarea
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={t("messagePlaceholder")}
                        className="min-h-[60px] max-h-[120px] resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSending || !messageInput.trim()}
                        size="icon"
                        className="shrink-0 self-end"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </Card>
      )}
    </>
  );
}

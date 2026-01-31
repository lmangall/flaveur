"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import {
  getOrCreateConversation,
  getConversationByGuestSession,
  getMyConversation,
  sendSupportMessage,
  pollMessages,
  type SupportMessage,
} from "@/actions/support";

const GUEST_SESSION_KEY = "oumamie_support_session";
const POLL_INTERVAL = 5000; // 5 seconds

interface GuestSession {
  sessionId: string;
  email: string;
}

export function useSupportChat() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [needsEmailInput, setNeedsEmailInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the last message ID for polling
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].message_id : 0;

  // Initialize conversation
  const initialize = useCallback(async () => {
    if (isSessionLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (session?.user) {
        // Authenticated user
        const result = await getMyConversation();
        if (result.success) {
          if (result.conversation) {
            setConversationId(result.conversation.conversation_id);
            setMessages(result.messages || []);
          }
          setNeedsEmailInput(false);
        }
      } else {
        // Guest - check localStorage for existing session
        const storedSession = localStorage.getItem(GUEST_SESSION_KEY);
        if (storedSession) {
          try {
            const { sessionId, email } = JSON.parse(storedSession) as GuestSession;
            const result = await getConversationByGuestSession(sessionId);
            if (result.success) {
              setGuestSessionId(sessionId);
              setGuestEmail(email);
              setConversationId(result.conversationId!);
              setMessages(result.messages || []);
              setNeedsEmailInput(false);
            } else {
              // Session invalid, clear it
              localStorage.removeItem(GUEST_SESSION_KEY);
              setNeedsEmailInput(true);
            }
          } catch {
            localStorage.removeItem(GUEST_SESSION_KEY);
            setNeedsEmailInput(true);
          }
        } else {
          setNeedsEmailInput(true);
        }
      }
    } catch (err) {
      console.error("[useSupportChat] Error initializing:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [session?.user, isSessionLoading]);

  // Initialize on mount and when session changes
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Start a guest conversation with email
  const initGuestSession = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrCreateConversation({ guestEmail: email });
      if (result.success) {
        const sessionId = result.guestSessionId!;
        localStorage.setItem(
          GUEST_SESSION_KEY,
          JSON.stringify({ sessionId, email })
        );
        setGuestSessionId(sessionId);
        setGuestEmail(email);
        setConversationId(result.conversationId!);
        setMessages(result.messages || []);
        setNeedsEmailInput(false);
        return true;
      } else {
        setError(result.error || "Failed to start conversation");
        return false;
      }
    } catch (err) {
      console.error("[useSupportChat] Error starting guest session:", err);
      setError("Failed to start conversation");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start an authenticated user conversation
  const initUserConversation = useCallback(async () => {
    if (!session?.user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrCreateConversation();
      if (result.success) {
        setConversationId(result.conversationId!);
        setMessages(result.messages || []);
        return true;
      } else {
        setError(result.error || "Failed to start conversation");
        return false;
      }
    } catch (err) {
      console.error("[useSupportChat] Error starting user conversation:", err);
      setError("Failed to start conversation");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return false;

      // If no conversation exists, create one first
      if (!conversationId) {
        if (session?.user) {
          const created = await initUserConversation();
          if (!created) return false;
        } else if (guestSessionId) {
          // Should have conversation already
          setError("No active conversation");
          return false;
        } else {
          setError("Please enter your email first");
          return false;
        }
      }

      setIsSending(true);
      setError(null);

      try {
        const result = await sendSupportMessage({
          conversationId: conversationId!,
          content: content.trim(),
          senderType: session?.user ? "user" : "guest",
          guestSessionId: guestSessionId || undefined,
        });

        if (result.success && result.message) {
          setMessages((prev) => [...prev, result.message]);
          return true;
        } else {
          setError(result.error || "Failed to send message");
          return false;
        }
      } catch (err) {
        console.error("[useSupportChat] Error sending message:", err);
        setError("Failed to send message");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, session?.user, guestSessionId, initUserConversation]
  );

  // Poll for new messages
  const poll = useCallback(async () => {
    if (!conversationId || lastMessageId === 0) return;

    try {
      const result = await pollMessages(
        conversationId,
        lastMessageId,
        guestSessionId || undefined
      );
      if (result.success && result.messages && result.messages.length > 0) {
        setMessages((prev) => [...prev, ...result.messages!]);
      }
    } catch (err) {
      console.error("[useSupportChat] Error polling:", err);
    }
  }, [conversationId, lastMessageId, guestSessionId]);

  // Start/stop polling when conversation exists
  useEffect(() => {
    if (conversationId && lastMessageId > 0) {
      pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [conversationId, lastMessageId, poll]);

  // Clear guest session (for testing/logout)
  const clearSession = useCallback(() => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setConversationId(null);
    setGuestSessionId(null);
    setGuestEmail("");
    setMessages([]);
    setNeedsEmailInput(true);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    guestEmail,
    setGuestEmail,
    sendMessage,
    isLoading,
    isSending,
    needsEmailInput,
    initGuestSession,
    initUserConversation,
    error,
    isAuthenticated: !!session?.user,
    isInitialized,
    clearSession,
  };
}

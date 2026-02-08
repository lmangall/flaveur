"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import {
  getOrCreateConversation,
  getConversationByGuestSession,
  getMyConversation,
  sendSupportMessage,
  updateTypingStatus,
  type SupportMessage,
} from "@/actions/support";
import {
  getPusherClient,
  getConversationChannel,
  PUSHER_EVENTS,
} from "@/lib/pusher-client";
import type { Channel } from "pusher-js";

const GUEST_SESSION_KEY = "oumamie_support_session";

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
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const channelRef = useRef<Channel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize conversation - only loads existing conversations, does NOT create new ones
  const initialize = useCallback(async () => {
    if (isSessionLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (session?.user) {
        // Authenticated user - check for existing conversation
        const result = await getMyConversation();
        if (result.success) {
          if (result.conversation) {
            setConversationId(result.conversation.conversation_id);
            setMessages(result.messages || []);
          }
          setNeedsEmailInput(false);
        }
      } else {
        // Guest - check localStorage for existing session only
        const storedSession = localStorage.getItem(GUEST_SESSION_KEY);
        if (storedSession) {
          try {
            const { sessionId, email } = JSON.parse(storedSession) as GuestSession;
            const result = await getConversationByGuestSession(sessionId);
            if (result.success) {
              setGuestSessionId(sessionId);
              setGuestEmail(email || "");
              setConversationId(result.conversationId!);
              setMessages(result.messages || []);
              setNeedsEmailInput(false);
            } else {
              // Session invalid, clear it (don't auto-create)
              localStorage.removeItem(GUEST_SESSION_KEY);
            }
          } catch {
            localStorage.removeItem(GUEST_SESSION_KEY);
          }
        }
        // No existing session? Don't create one yet - wait for user to interact
      }
    } catch (err) {
      console.error("[useSupportChat] Error initializing:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [session?.user, isSessionLoading]);

  // Ensure a conversation exists - creates one if needed (call when user opens chat)
  const ensureConversation = useCallback(async () => {
    // Already have a conversation
    if (conversationId) return true;

    setIsLoading(true);
    setError(null);

    try {
      if (session?.user) {
        // Authenticated user - create conversation
        const result = await getOrCreateConversation();
        if (result.success) {
          setConversationId(result.conversationId!);
          setMessages(result.messages || []);
          return true;
        }
      } else {
        // Guest - create conversation without email
        const result = await getOrCreateConversation();
        if (result.success) {
          const sessionId = result.guestSessionId!;
          localStorage.setItem(
            GUEST_SESSION_KEY,
            JSON.stringify({ sessionId, email: "" })
          );
          setGuestSessionId(sessionId);
          setConversationId(result.conversationId!);
          setMessages(result.messages || []);
          setNeedsEmailInput(false);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("[useSupportChat] Error ensuring conversation:", err);
      setError("Failed to start conversation");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, session?.user]);

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
          // Message will arrive via Pusher, but also add locally for instant feedback
          setMessages((prev) => {
            if (prev.some((m) => m.message_id === result.message!.message_id)) {
              return prev;
            }
            return [...prev, result.message!];
          });
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

  // Send typing indicator (debounced)
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Update typing status
      updateTypingStatus(conversationId, isTyping, guestSessionId || undefined).catch((err) =>
        console.error("[useSupportChat] Error updating typing status:", err)
      );

      // Auto-clear typing after 3 seconds of no activity
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          updateTypingStatus(conversationId, false, guestSessionId || undefined).catch((err) =>
            console.error("[useSupportChat] Error clearing typing status:", err)
          );
        }, 3000);
      }
    },
    [conversationId, guestSessionId]
  );

  // Subscribe to Pusher channel when conversation exists
  useEffect(() => {
    if (!conversationId) return;

    const pusher = getPusherClient();
    const channelName = getConversationChannel(conversationId);

    // Subscribe to the private channel
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Handle new messages
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (message: SupportMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.message_id === message.message_id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Handle typing events
    channel.bind(PUSHER_EVENTS.TYPING_START, (data: { isAdmin: boolean }) => {
      if (data.isAdmin) {
        setAdminIsTyping(true);
      }
    });

    channel.bind(PUSHER_EVENTS.TYPING_STOP, (data: { isAdmin: boolean }) => {
      if (data.isAdmin) {
        setAdminIsTyping(false);
      }
    });

    // Cleanup on unmount or conversation change
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [conversationId]);

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
    ensureConversation,
    error,
    isAuthenticated: !!session?.user,
    isInitialized,
    clearSession,
    adminIsTyping,
    setTyping,
  };
}

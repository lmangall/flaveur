"use client";

import PusherClient from "pusher-js";

// Singleton Pusher client instance
let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      // For private channels, we need to authenticate
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });
  }
  return pusherClient;
};

// Channel naming (must match server)
export const getConversationChannel = (conversationId: number) =>
  `private-conversation-${conversationId}`;

// Event names (must match server)
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
} as const;

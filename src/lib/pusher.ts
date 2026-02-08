import Pusher from "pusher";

// Server-side Pusher client for triggering events
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Channel naming conventions
export const getConversationChannel = (conversationId: number) =>
  `private-conversation-${conversationId}`;

// Event names
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
} as const;

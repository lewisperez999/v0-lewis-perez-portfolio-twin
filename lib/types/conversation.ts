export interface Conversation {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  isFinal: boolean;
  status: "speaking" | "processing" | "final";
}
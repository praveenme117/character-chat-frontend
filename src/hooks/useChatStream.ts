"use client";

import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChatStream(
  conversationId: string,
  userData: { name: string; city: string }
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setIsStreaming(true);
      setError(null);

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, newMessage]);

      const source = new EventSource(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/chat/stream?conversationId=${conversationId}&message=${encodeURIComponent(
          content
        )}&userData=${encodeURIComponent(JSON.stringify(userData))}`
      );

      let aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, aiMessage]);

      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === "token") {
          aiMessage.content += data.content;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { ...aiMessage, content: aiMessage.content },
          ]);
        } else if (data.event === "done") {
          source.close();
          setIsStreaming(false);
          // Backend already saves message, no need to save here
        } else if (data.event === "error") {
          setError(data.error);
          source.close();
          setIsStreaming(false);
        } else if (data.event === "ping") {
          console.log("Heartbeat received");
        }
      };

      source.onerror = () => {
        setError("Connection lost. Reconnecting...");
        source.close();
        setIsStreaming(false);
        // Attempt reconnect
        setTimeout(() => sendMessage(content), 5000);
      };

      return () => source.close();
    },
    [conversationId, userData]
  );

  return { messages, setMessages, isStreaming, error, sendMessage };
}

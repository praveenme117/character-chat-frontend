"use client";

import { useState, useCallback, useEffect, useRef } from "react";

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
  const aiMessageRef = useRef<ChatMessage | null>(null);
  const flushTimerRef = useRef<number | null>(null);
  const tokenBufferRef = useRef<string>("");

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

      const locale = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'en') : 'en';
      const source = new EventSource(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/stream?conversationId=${conversationId}&message=${encodeURIComponent(
          content
        )}&userData=${encodeURIComponent(JSON.stringify(userData))}&lang=${encodeURIComponent(locale)}`
      );

      aiMessageRef.current = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, aiMessageRef.current as ChatMessage]);

      // Smooth buffered token handling
      const scheduleFlush = () => {
        if (flushTimerRef.current != null) return;
        flushTimerRef.current = window.setTimeout(() => {
          flushTimerRef.current = null;
          const ai = aiMessageRef.current;
          const chunk = tokenBufferRef.current;
          if (!ai || !chunk) return;
          tokenBufferRef.current = "";
          ai.content += chunk;
          setMessages((prev) => [...prev.slice(0, -1), { ...ai }]);
        }, 40); // ~25fps smoothness
      };

      source.addEventListener("token", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        tokenBufferRef.current += data.content;
        scheduleFlush();
      });

      source.addEventListener("done", () => {
        source.close();
        // Final flush
        const ai = aiMessageRef.current;
        const chunk = tokenBufferRef.current;
        if (ai && chunk) {
          ai.content += chunk;
          tokenBufferRef.current = "";
          setMessages((prev) => [...prev.slice(0, -1), { ...ai }]);
        }
        setIsStreaming(false);
        // Backend already saves message, no need to save here
      });

      source.addEventListener("error", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        setError(data.error);
        source.close();
        setIsStreaming(false);
      });

      source.addEventListener("ping", () => {
        console.log("Heartbeat received");
      });

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

  // Persist messages client-side per-locale and conversation for quick reloads
  useEffect(() => {
    if (typeof window === "undefined" || !conversationId) return;
    const locale = window.location.pathname.split("/")[1] || "en";
    const key = `chat_${locale}_messages_${conversationId}`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {}
  }, [messages, conversationId]);

  return { messages, setMessages, isStreaming, error, sendMessage };
}

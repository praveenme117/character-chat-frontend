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
  const currentSourceRef = useRef<EventSource | null>(null);

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
      // Close existing connection if any
      if (currentSourceRef.current) {
        currentSourceRef.current.close();
      }
      
      const source = new EventSource(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/stream?conversationId=${conversationId}&message=${encodeURIComponent(
          content
        )}&userData=${encodeURIComponent(JSON.stringify(userData))}&lang=${encodeURIComponent(locale)}`
      );
      currentSourceRef.current = source;

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
        try {
          const raw = (event as MessageEvent).data;
          if (!raw) return;
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (data && typeof data.content === 'string') {
            tokenBufferRef.current += data.content;
            scheduleFlush();
          }
        } catch (e) {
          // Ignore malformed token events
        }
      });

      source.addEventListener("done", () => {
        // Final flush
        const ai = aiMessageRef.current;
        const chunk = tokenBufferRef.current;
        if (ai && chunk) {
          ai.content += chunk;
          tokenBufferRef.current = "";
          setMessages((prev) => [...prev.slice(0, -1), { ...ai }]);
        }
        setIsStreaming(false);
        // Close this message stream naturally
        try { source.close(); } catch {}
        // Backend already saves message, no need to save here
      });

      source.addEventListener("error", (event) => {
        try {
          const raw = (event as MessageEvent).data;
          if (raw) {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (data?.error) setError(data.error);
            else setError("Connection error");
          } else {
            setError("Connection error");
          }
        } catch {
          setError("Connection error");
        }
        source.close();
        setIsStreaming(false);
      });

      source.addEventListener("ping", () => {
        console.log("Heartbeat received");
      });

      source.onerror = () => {
        // No automatic retries; surface the error and allow manual resend
        try { source.close(); } catch {}
        setIsStreaming(false);
        if (!error) setError("Connection error");
      };

      return () => {
        // Cleanup function - don't close here, let it stay open for next messages
      };
    },
    [conversationId, userData]
  );

  // Do not persist messages to localStorage; rely on server history only

  // Cleanup EventSource when component unmounts or user leaves
  useEffect(() => {
    return () => {
      if (currentSourceRef.current) {
        console.log('Closing EventSource connection - user left page');
        currentSourceRef.current.close();
        currentSourceRef.current = null;
      }
    };
  }, []);

  const closeConnection = useCallback(() => {
    if (currentSourceRef.current) {
      console.log('Manually closing EventSource connection');
      currentSourceRef.current.close();
      currentSourceRef.current = null;
    }
  }, []);

  return { messages, setMessages, isStreaming, error, sendMessage, closeConnection };
}

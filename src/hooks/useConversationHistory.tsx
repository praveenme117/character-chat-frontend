import axios from 'axios';
import { useEffect, useState } from 'react';
import { ChatMessage } from './useChatStream';

interface Avatar {
  id: number;
  staticUrl: string;
  listeningUrl: string;
  speakingUrl: string;
  tapUrl: string;
}

export function useConversationHistory(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return; // Nothing to fetch without an id
    const fetchConversation = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations/${conversationId}`);
        setMessages(response.data.messages.slice(-50)); // Last 50 messages
        setAvatar({
          id: response.data.avatar.id,
          staticUrl: response.data.avatar.staticUrl,
          listeningUrl: response.data.avatar.listeningUrl,
          speakingUrl: response.data.avatar.speakingUrl,
          tapUrl: response.data.avatar.tapUrl,
        });
      } catch (error: any) {
        console.error('Failed to load conversation:', error);
        setError(error.response?.data?.error || 'Failed to load conversation');
      }
    };
    fetchConversation();
  }, [conversationId]);

  // Hydrate from localStorage first for instant UI
  useEffect(() => {
    if (typeof window === 'undefined' || !conversationId) return;
    const locale = window.location.pathname.split('/')[1] || 'en';
    const key = `chat_${locale}_messages_${conversationId}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) setMessages(JSON.parse(cached));
    } catch {}
  }, [conversationId]);

  return { messages, setMessages, avatar, error };
}

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

  // Hydrate from localStorage first for instant UI
  useEffect(() => {
    if (typeof window === 'undefined' || !conversationId) return;
    const locale = window.location.pathname.split('/')[1] || 'en';
    const key = `chat_${locale}_messages_${conversationId}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const cachedMessages = JSON.parse(cached);
        console.log('Loaded cached messages:', cachedMessages.length);
        setMessages(cachedMessages);
      }
    } catch (e) {
      console.warn('Failed to load cached messages:', e);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      console.log('No conversationId, skipping history fetch');
      // Set default avatar when no conversation
      setAvatar({
        id: 1,
        staticUrl: "/images/still.gif",
        listeningUrl: "/images/listening.gif",
        speakingUrl: "/images/speaking.gif",
        tapUrl: "/images/start.gif",
      });
      return;
    }
    
    const fetchConversation = async () => {
      console.log('Fetching conversation history for:', conversationId);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations/${conversationId}`);
        console.log('Conversation response:', response.data);
        
        if (response.data.messages) {
          setMessages(response.data.messages.slice(-50)); // Last 50 messages
        }
        
        if (response.data.avatar) {
          setAvatar({
            id: response.data.avatar.id,
            staticUrl: response.data.avatar.staticUrl,
            listeningUrl: response.data.avatar.listeningUrl,
            speakingUrl: response.data.avatar.speakingUrl,
            tapUrl: response.data.avatar.tapUrl,
          });
        } else {
          // Fallback avatar
          setAvatar({
            id: 1,
            staticUrl: "/images/still.gif",
            listeningUrl: "/images/listening.gif",
            speakingUrl: "/images/speaking.gif",
            tapUrl: "/images/start.gif",
          });
        }
        
        setError(null);
      } catch (error: any) {
        console.error('Failed to load conversation:', error);
        console.error('Error details:', error.response?.data);
        
        // Set fallback avatar even on error
        setAvatar({
          id: 1,
          staticUrl: "/images/still.gif",
          listeningUrl: "/images/listening.gif",
          speakingUrl: "/images/speaking.gif",
          tapUrl: "/images/start.gif",
        });
        
        if (error.response?.status === 404) {
          console.log('Conversation not found, starting fresh');
          setError(null); // Don't show error for new conversations
        } else {
          setError(error.response?.data?.error || 'Failed to load conversation');
        }
      }
    };
    
    fetchConversation();
  }, [conversationId]);

  return { messages, setMessages, avatar, error };
}

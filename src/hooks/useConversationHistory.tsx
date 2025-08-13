import { api } from '@/lib/api';
import type { Avatar, ChatMessage } from '@/types';
import { useEffect, useState } from 'react';

export function useConversationHistory(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Do not hydrate from localStorage; rely solely on server history

  useEffect(() => {
    if (!conversationId || conversationId === '') {
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
      // backend URL resolved via api instance; log for debug consistency
      try {
        setLoading(true);
        const response = await api.get(`/api/conversations/${conversationId}`);
        console.log('Conversation response:', response.data);
        console.log('Response status:', response.status);
        
        const serverMessages = response.data?.messages;
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          console.log('Setting messages from response:', serverMessages.length, 'messages');
          setMessages(serverMessages.slice(-50)); // Last 50 messages
        } else {
          // Preserve any cached messages rather than overwriting with empty
          console.log('No server messages; preserving existing cached messages');
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversation();
  }, [conversationId]);

  return { messages, setMessages, avatar, error, loading };
}

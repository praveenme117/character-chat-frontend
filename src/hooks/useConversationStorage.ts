import { useState, useEffect, useCallback } from 'react';

interface ConversationStorage {
  getConversationId: (locale: string) => string | null;
  setConversationId: (locale: string, id: string) => void;
  clearConversationId: (locale: string) => void;
  clearAllConversations: () => void;
}

export function useConversationStorage(): ConversationStorage {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getConversationId = useCallback((locale: string): string | null => {
    if (!isClient) return null;
    try {
      const key = `chat_${locale}_sessionId`;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get conversation ID from localStorage:', error);
      return null;
    }
  }, [isClient]);

  const setConversationId = useCallback((locale: string, id: string): void => {
    if (!isClient) return;
    try {
      const key = `chat_${locale}_sessionId`;
      localStorage.setItem(key, id);
      console.log(`Stored conversation ID for ${locale}:`, id);
    } catch (error) {
      console.warn('Failed to store conversation ID in localStorage:', error);
    }
  }, [isClient]);

  const clearConversationId = useCallback((locale: string): void => {
    if (!isClient) return;
    try {
      const key = `chat_${locale}_sessionId`;
      localStorage.removeItem(key);
      console.log(`Cleared conversation ID for ${locale}`);
    } catch (error) {
      console.warn('Failed to clear conversation ID from localStorage:', error);
    }
  }, [isClient]);

  const clearAllConversations = useCallback((): void => {
    if (!isClient) return;
    try {
      localStorage.removeItem('chat_en_sessionId');
      localStorage.removeItem('chat_ja_sessionId');
      console.log('Cleared all conversation IDs');
    } catch (error) {
      console.warn('Failed to clear conversation IDs from localStorage:', error);
    }
  }, [isClient]);

  return {
    getConversationId,
    setConversationId,
    clearConversationId,
    clearAllConversations
  };
}

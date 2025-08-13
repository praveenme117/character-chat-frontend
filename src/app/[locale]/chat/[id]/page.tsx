'use client';

import React from 'react';

import BackgroundMedia from '@/components/BackgroundMedia';
import ChatComposer from '@/components/ChatComposer';
import ChatMessageList from '@/components/ChatMessageList';
import ErrorMessage from '@/components/ErrorMessage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SuggestionsBar from '@/components/SuggestionsBar';
import { useChatStream } from '@/hooks/useChatStream';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ChatPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const routeParams = useParams<{ locale: string; id: string }>();
  const [conversationId, setConversationId] = useState<string>('');
  const [userData, setUserData] = useState<{ name: string; city: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [bgIndex, setBgIndex] = React.useState(0);
  
  useEffect(() => {
    // Sync local state with route param
    setConversationId((routeParams?.id as string) || '');
  }, [routeParams?.id]);

  // Parse userData from URL params
  useEffect(() => {
    const userDataParam = searchParams.get('userData');
    if (userDataParam) {
      try {
        setUserData(JSON.parse(decodeURIComponent(userDataParam)));
      } catch (error) {
        console.error('Failed to parse userData:', error);
        // Use seeded user data - randomly pick John from Tokyo or Aiko from Osaka
        const seededUsers = [
          { name: 'John', city: 'Tokyo' },
          { name: 'Aiko', city: 'Osaka' }
        ];
        setUserData(seededUsers[Math.floor(Math.random() * seededUsers.length)]);
      }
    } else {
      // Use seeded user data - randomly pick John from Tokyo or Aiko from Osaka
      const seededUsers = [
        { name: 'John', city: 'Tokyo' },
        { name: 'Aiko', city: 'Osaka' }
      ];
      setUserData(seededUsers[Math.floor(Math.random() * seededUsers.length)]);
    }
  }, [searchParams]);

  // Load conversation history - only when conversationId is available
  const { 
    messages: historyMessages, 
    setMessages: setHistoryMessages, 
    avatar, 
    error: historyError,
    loading: historyLoading
  } = useConversationHistory(conversationId);

  // Chat streaming hook
  const { 
    messages: streamMessages, 
    setMessages: setStreamMessages, 
    isStreaming, 
    error: streamError, 
    sendMessage,
    closeConnection
  } = useChatStream(conversationId, userData || { name: 'User', city: 'Unknown' });

  // Cleanup chat connection when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      closeConnection();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        closeConnection();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      closeConnection();
    };
  }, [closeConnection]);

  // Update stream messages when history loads
  useEffect(() => {
    if (historyMessages.length > 0) {
      setStreamMessages((prev) => (prev.length === 0 ? historyMessages : prev));
    }
  }, [conversationId, historyMessages, setStreamMessages]);

  // Clear stream messages when switching to a new conversation
  useEffect(() => {
    setStreamMessages([]);
  }, [conversationId, setStreamMessages]);

  // Media cycle for background - must be after avatar is available
  const mediaCycle = useMemo(() => {
    if (!avatar) return ['/images/still.gif', '/images/listening.gif', '/images/speaking.gif'];
    return [avatar.staticUrl, avatar.listeningUrl, avatar.speakingUrl];
  }, [avatar]);

  // Always render streaming messages; they are initialized from history
  const allMessages = streamMessages;
  const backgroundSrc = mediaCycle[bgIndex % mediaCycle.length];
  const error = historyError || streamError;

  const handleSendMessage = useCallback(async (content: string) => {
    setIsTyping(true);
    try {
      await sendMessage(content);
    } finally {
      setIsTyping(false);
    }
  }, [sendMessage]);

  // Navigation handled by LanguageSwitcher

  if (!conversationId || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 glass-card text-center animate-fade-in-up">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-white font-semibold mb-2">Initializing Chat</h3>
          <p className="text-white/60 text-sm">Setting up your conversation...</p>
        </div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 glass-card text-center animate-fade-in-up">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-white font-semibold mb-2">Loading Avatar</h3>
          <p className="text-white/60 text-sm">Preparing your AI companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen p-4" onClick={() => setBgIndex((i) => i + 1)}>
      <BackgroundMedia imageFallback={backgroundSrc} />

      <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full">
        {/* Controls */}
        <div className="flex justify-end items-center mb-4">
          <LanguageSwitcher />
        </div>
        
        {error && <ErrorMessage message={error} />}
        {historyLoading && (
          <div className="glass-card mb-3 p-3 flex items-center gap-3">
            <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
            <span className="text-white/70 text-sm">Loading conversation…</span>
          </div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Only chat section on background */}
          <div className="flex flex-col min-h-0">
            <div className="flex-1 mb-2">
              <ChatMessageList messages={allMessages} />
            </div>

            <div className="mt-auto space-y-2">
              <SuggestionsBar disabled={isStreaming} onSelect={handleSendMessage} />
              <ChatComposer 
                isStreaming={isStreaming} 
                sendMessage={handleSendMessage} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
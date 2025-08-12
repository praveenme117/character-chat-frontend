'use client';

import React from 'react';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatComposer from '@/components/ChatComposer';
import ChatMessageList from '@/components/ChatMessageList';
import ChatScreen from '@/components/ChatScreen';
import ErrorMessage from '@/components/ErrorMessage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useChatStream } from '@/hooks/useChatStream';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import BackgroundMedia from '@/components/BackgroundMedia';
import SuggestionsBar from '@/components/SuggestionsBar';
import { useMemo } from 'react';

export default function ChatPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const searchParams = useSearchParams();
  const [conversationId, setConversationId] = useState<string>('');
  const [userData, setUserData] = useState<{ name: string; city: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [bgIndex, setBgIndex] = React.useState(0);
  
  useEffect(() => {
    params.then((p) => setConversationId(p.id));
  }, [params]);

  // Parse userData from URL params
  useEffect(() => {
    const userDataParam = searchParams.get('userData');
    if (userDataParam) {
      try {
        setUserData(JSON.parse(decodeURIComponent(userDataParam)));
      } catch (error) {
        console.error('Failed to parse userData:', error);
        setUserData({ name: 'User', city: 'Unknown' });
      }
    } else {
      setUserData({ name: 'User', city: 'Unknown' });
    }
  }, [searchParams]);

  // Load conversation history
  const { 
    messages: historyMessages, 
    setMessages: setHistoryMessages, 
    avatar, 
    error: historyError 
  } = useConversationHistory(conversationId);

  // Chat streaming hook
  const { 
    messages: streamMessages, 
    setMessages: setStreamMessages, 
    isStreaming, 
    error: streamError, 
    sendMessage 
  } = useChatStream(conversationId, userData || { name: 'User', city: 'Unknown' });

  // Update stream messages when history loads
  useEffect(() => {
    if (historyMessages.length > 0) {
      setStreamMessages(historyMessages);
    }
  }, [historyMessages, setStreamMessages]);

  // Media cycle for background - must be after avatar is available
  const mediaCycle = useMemo(() => {
    if (!avatar) return ['/images/still.gif', '/images/listening.gif', '/images/speaking.gif'];
    return [avatar.staticUrl, avatar.listeningUrl, avatar.speakingUrl];
  }, [avatar]);

  // Combine history and streaming messages
  const allMessages = historyMessages.length > 0 ? historyMessages : streamMessages;
  const backgroundSrc = mediaCycle[bgIndex % mediaCycle.length];
  const error = historyError || streamError;

  const handleSendMessage = async (content: string) => {
    setIsTyping(true);
    try {
      await sendMessage(content);
    } finally {
      setIsTyping(false);
    }
  };

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

  console.log('ChatPage rendering with backgroundSrc:', backgroundSrc, 'avatar:', avatar);
  
  return (
    <div className="relative flex flex-col min-h-screen p-4" onClick={() => setBgIndex((i) => i + 1)}>
      <BackgroundMedia imageFallback={backgroundSrc} />

      <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full">
        {/* Controls */}
        <div className="flex justify-end items-center mb-4">
          <LanguageSwitcher />
        </div>
        
        {error && <ErrorMessage message={error} />}
        
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
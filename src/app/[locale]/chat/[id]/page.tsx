'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatComposer from '@/components/ChatComposer';
import ChatMessageList from '@/components/ChatMessageList';
import ChatScreen from '@/components/ChatScreen';
import ErrorMessage from '@/components/ErrorMessage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useChatStream } from '@/hooks/useChatStream';
import { useConversationHistory } from '@/hooks/useConversationHistory';

export default function ChatPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const searchParams = useSearchParams();
  const [conversationId, setConversationId] = useState<string>('');
  
  useEffect(() => {
    params.then((p) => setConversationId(p.id));
  }, [params]);
  const [userData, setUserData] = useState<{ name: string; city: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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

  // Combine history and streaming messages
  const allMessages = historyMessages.length > 0 ? historyMessages : streamMessages;

  // Update stream messages when history loads
  useEffect(() => {
    if (historyMessages.length > 0) {
      setStreamMessages(historyMessages);
    }
  }, [historyMessages, setStreamMessages]);

  const handleSendMessage = async (content: string) => {
    setIsTyping(true);
    try {
      await sendMessage(content);
    } finally {
      setIsTyping(false);
    }
  };

  const error = historyError || streamError;

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
    <div className="flex flex-col min-h-screen p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
      
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="glass-card px-4 py-2">
            <h1 className="text-white font-semibold">Chat Session</h1>
          </div>
          <LanguageSwitcher />
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Avatar Section */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="glass-card w-full max-w-sm text-center sticky top-4">
              <ChatScreen 
                avatar={avatar} 
                isStreaming={isStreaming} 
                isTyping={isTyping} 
              />
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-400 animate-pulse' : isTyping ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white/70 text-sm">
                    {isStreaming ? 'Speaking...' : isTyping ? 'Listening...' : 'Ready'}
                  </span>
                </div>
                
                {userData && (
                  <div className="text-white/50 text-xs">
                    Hello, {userData.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Section */}
          <div className="lg:w-2/3 flex flex-col min-h-0">
            <div className="flex-1 mb-4">
              <ChatMessageList messages={allMessages} />
            </div>
            
            <div className="mt-auto">
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
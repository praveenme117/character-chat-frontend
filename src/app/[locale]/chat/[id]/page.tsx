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
        <div>Loading...</div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading avatar...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <LanguageSwitcher />
      
      {error && <ErrorMessage message={error} />}
      
      <div className="flex flex-col items-center max-w-2xl w-full">
        <ChatScreen 
          avatar={avatar} 
          isStreaming={isStreaming} 
          isTyping={isTyping} 
        />
        
        <ChatMessageList messages={allMessages} />
        
        <ChatComposer 
          isStreaming={isStreaming} 
          sendMessage={handleSendMessage} 
        />
      </div>
    </div>
  );
}
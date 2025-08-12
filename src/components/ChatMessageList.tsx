'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '../hooks/useChatStream';

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="glass-card w-full h-[60vh] lg:h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <h3 className="text-white font-semibold">Conversation</h3>
        <div className="text-white/50 text-sm">{messages.length} messages</div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id ?? idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${isUser ? 'message-user' : 'message-ai'}`}>
                    <div className="flex items-start gap-2">
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white mt-1">AI</div>
                      )}
                      <div className="flex-1">
                        <div className={`text-sm font-medium mb-1 ${isUser ? 'text-white/90' : 'text-gray-600'}`}>{isUser ? 'You' : 'Assistant'}</div>
                        <div className={`leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>{m.content}</div>
                      </div>
                      {isUser && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white mt-1">U</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

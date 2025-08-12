'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ChatComposerProps {
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export default function ChatComposer({ isStreaming, sendMessage }: ChatComposerProps) {
  const t = useTranslations('home');
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="glass-card p-2 flex gap-2 sticky bottom-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="input-premium flex-1 min-w-0"
          disabled={isStreaming}
        />
        <button 
          type="submit" 
          className="btn-premium px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="loading-spinner"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{t('send')}</span>
            </div>
          )}
        </button>
      </form>
      
      <div className="mt-2 text-center">
        <p className="text-white/40 text-xs">
          Press Enter to send • {input.length}/500 characters
        </p>
      </div>
    </div>
  );
}

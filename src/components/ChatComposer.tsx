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
    <form onSubmit={handleSubmit} className="w-full max-w-md flex">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('placeholder')}
        className="flex-1 p-2 border rounded-l"
        disabled={isStreaming}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-r" disabled={isStreaming}>
        {t('send')}
      </button>
    </form>
  );
}

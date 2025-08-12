'use client';

import axios from 'axios';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { avatars } from '../../lib/avatars';
import BackgroundMedia from '@/components/BackgroundMedia';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en');
  
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);
  const t = useTranslations('home');
  const router = useRouter();
  const [tappedAvatar, setTappedAvatar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce rapid clicks: ignore if already creating
  const creatingRef = (globalThis as any).__creatingSessionRef ?? ((globalThis as any).__creatingSessionRef = { current: false });
  const handleAvatarTap = async (avatarId: number) => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setTappedAvatar(avatarId);
    setError(null);
    try {
      const userData = { name: 'User', city: 'Unknown' };
      const payload = { avatarId, userData };
      console.log('Sending session creation request:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Session created successfully:', response.data);
      // Persist English session by default on home enter, Japanese will be created when switching
      if (locale === 'en') {
        try { localStorage.setItem('chat_en_sessionId', response.data.sessionId); } catch {}
      }
      setTimeout(() => {
        router.push(`/${locale}/chat/${response.data.sessionId}?userData=${encodeURIComponent(JSON.stringify(userData))}`);
      }, 300);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
      setTappedAvatar(null);
    } finally {
      creatingRef.current = false;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6" onClick={() => handleAvatarTap(1)}>
      <BackgroundMedia imageFallback="/images/still.gif" />

      <div className="relative z-10 max-w-5xl w-full text-center select-none">
        {error && (
          <div className="glass-card mb-8 border-red-400/30 bg-red-500/10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse-slow"></div>
              <span className="text-red-100 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-white/70 font-light">Tap anywhere to start</p>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/60 text-sm">Creating a new chat session with the default avatar</p>
        </div>
      </div>
    </div>
  );
}

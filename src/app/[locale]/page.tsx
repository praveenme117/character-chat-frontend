'use client';

import axios from 'axios';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { avatars } from '../../lib/avatars';
import BackgroundMedia from '@/components/BackgroundMedia';
import { useConversationStorage } from '@/hooks/useConversationStorage';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en');
  
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);
  const t = useTranslations('home');
  const router = useRouter();
  const [tappedAvatar, setTappedAvatar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setConversationId: storeConversationId, clearConversationId } = useConversationStorage();

  // Debounce rapid clicks: ignore if already creating
  const creatingRef = (globalThis as any).__creatingSessionRef ?? ((globalThis as any).__creatingSessionRef = { current: false });
  const handleAvatarTap = async (avatarId: number) => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setTappedAvatar(avatarId);
    setError(null);
    setIsLoading(true);
    
    try {
      // Clear existing conversation for this locale when starting new chat
      clearConversationId(locale);
      
      // Use seeded user data - randomly pick John from Tokyo or Aiko from Osaka
      const seededUsers = [
        { name: 'John', city: 'Tokyo' },
        { name: 'Aiko', city: 'Osaka' }
      ];
      const userData = seededUsers[Math.floor(Math.random() * seededUsers.length)];
      const payload = { avatarId, userData };
      console.log('Sending session creation request:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Session created successfully:', response.data);
      
      // Store the new conversation ID for this locale
      storeConversationId(locale, response.data.sessionId);
      
      setTimeout(() => {
        router.push(`/${locale}/chat/${response.data.sessionId}?userData=${encodeURIComponent(JSON.stringify(userData))}`);
      }, 300);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
      setTappedAvatar(null);
    } finally {
      creatingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
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
          <p className="text-xl text-white/70 font-light">Choose your AI companion</p>
        </div>

        {/* Avatar Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 relative ${
                isLoading && tappedAvatar === avatar.id ? 'pointer-events-none' : ''
              }`}
              onClick={() => handleAvatarTap(avatar.id)}
            >
              <Image
                src={
                  tappedAvatar === avatar.id
                    ? avatar.tapUrl || avatar.staticUrl
                    : avatar.staticUrl
                }
                alt={`Avatar ${avatar.id}`}
                width={200}
                height={200}
                className={`rounded-full shadow-2xl transition-all duration-300 ${
                  isLoading && tappedAvatar === avatar.id ? 'opacity-50' : ''
                }`}
              />
              
              {/* Loading overlay */}
              {isLoading && tappedAvatar === avatar.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="loading-spinner w-12 h-12 border-4 border-white/30 border-t-white"></div>
                </div>
              )}
              
              {/* Avatar label */}
              <div className="mt-4 text-center">
                <p className="text-white/80 font-medium">Avatar {avatar.id}</p>
                {isLoading && tappedAvatar === avatar.id && (
                  <p className="text-white/60 text-sm mt-1">Creating session...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

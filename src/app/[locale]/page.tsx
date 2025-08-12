'use client';

import axios from 'axios';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { avatars } from '../../lib/avatars';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en');
  
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);
  const t = useTranslations('home');
  const router = useRouter();
  const [tappedAvatar, setTappedAvatar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarTap = async (avatarId: number) => {
    setTappedAvatar(avatarId);
    setError(null);
    try {
      const userData = { name: 'User', city: 'Unknown' };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session`, {
        avatarId,
        userData,
      });
      console.log('Session created:', response.data);
      setTimeout(() => {
        router.push(`/${locale}/chat/${response.data.sessionId}?userData=${encodeURIComponent(JSON.stringify(userData))}`);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
      setTappedAvatar(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
      
      <div className="relative z-10 max-w-4xl w-full">
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
          <p className="text-xl text-white/70 font-light">
            Choose your AI companion and start chatting
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {avatars.map((avatar, index) => (
            <div
              key={avatar.id}
              className="glass-card cursor-pointer group relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleAvatarTap(avatar.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex flex-col items-center p-4">
                <div className={`relative ${tappedAvatar === avatar.id ? 'animate-pulse-slow' : 'animate-float'}`}>
                  <Image
                    src={tappedAvatar === avatar.id ? avatar.tapUrl || avatar.staticUrl : avatar.staticUrl}
                    alt={`Avatar ${avatar.id}`}
                    width={160}
                    height={160}
                    className="rounded-full shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {tappedAvatar === avatar.id && (
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Avatar {avatar.id}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {tappedAvatar === avatar.id && (
                <div className="absolute top-4 right-4">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/50 text-sm">
            Click on an avatar to start your conversation
          </p>
        </div>
      </div>
    </div>
  );
}

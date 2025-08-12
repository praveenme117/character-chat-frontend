'use client';

import axios from 'axios';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { avatars } from '../../lib/avatars';

export default function Home({ params }: { params: { locale: string } }) {
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
        router.push(`/${params.locale}/chat/${response.data.sessionId}?userData=${encodeURIComponent(JSON.stringify(userData))}`);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
      setTappedAvatar(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h1 className="text-2xl mb-8">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleAvatarTap(avatar.id)}
          >
            <Image
              src={tappedAvatar === avatar.id ? avatar.tapUrl || avatar.staticUrl : avatar.staticUrl}
              alt={`Avatar ${avatar.id}`}
              width={200}
              height={200}
              className="rounded-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

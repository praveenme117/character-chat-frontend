'use client';

import Image from 'next/image';

interface CharacterScreenProps {
  avatar: {
    id: number;
    staticUrl: string;
    listeningUrl: string;
    speakingUrl: string;
    tapUrl: string;
  };
  isStreaming: boolean;
  isTyping: boolean;
}

export default function CharacterScreen({ avatar, isStreaming, isTyping }: CharacterScreenProps) {
  const getCurrentMedia = () => {
    if (isStreaming) return avatar.speakingUrl;
    if (isTyping) return avatar.listeningUrl;
    return avatar.staticUrl;
  };

  return (
    <Image
      src={getCurrentMedia()}
      alt="Avatar"
      width={200}
      height={200}
      className="rounded-full mb-4"
      priority
      unoptimized // For GIFs to animate properly
      onError={(e) => console.error('Image load error:', e)}
    />
  );
}

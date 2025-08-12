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
    <div className="relative">
      <div className="relative group">
        <Image
          src={getCurrentMedia()}
          alt="Avatar"
          width={200}
          height={200}
          className="rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-105"
          priority
          unoptimized // For GIFs to animate properly
          onError={(e) => console.error('Image load error:', e)}
        />
        
        {/* Animated ring for streaming */}
        {isStreaming && (
          <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-pulse">
            <div className="absolute inset-2 rounded-full border-2 border-green-300/30 animate-ping"></div>
          </div>
        )}
        
        {/* Animated ring for typing */}
        {isTyping && !isStreaming && (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-pulse">
            <div className="absolute inset-2 rounded-full border-2 border-yellow-300/30 animate-ping"></div>
          </div>
        )}
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
}

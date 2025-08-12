'use client';

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
    <video
      src={getCurrentMedia()}
      autoPlay
      loop
      muted
      width={200}
      height={200}
      className="rounded-full mb-4"
      onError={(e) => console.error('Video load error:', e)}
    />
  );
}

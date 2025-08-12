'use client';

import { useEffect, useRef } from 'react';

type BackgroundMediaProps = {
  imageFallback?: string;
  videoSrc?: string;
  className?: string;
  overlayGradient?: boolean;
};

export default function BackgroundMedia({ imageFallback, videoSrc, className, overlayGradient = true }: BackgroundMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = async () => {
      try {
        await video.play();
      } catch {
        // ignore autoplay errors
      }
    };
    play();
  }, [videoSrc]);

  return (
    <div className={`fixed inset-0 z-0 ${className ?? ''}`}>
      {videoSrc ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : imageFallback ? (
        // Use a plain img to ensure GIFs animate
        <img 
          src={imageFallback} 
          alt="Background" 
          className="w-full h-full object-cover"
          onLoad={() => console.log('Background image loaded:', imageFallback)}
          onError={(e) => console.error('Background image failed to load:', imageFallback, e)}
        />
      ) : null}

      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
      )}
    </div>
  );
}



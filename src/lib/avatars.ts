export const avatars = [
  {
    id: 1,
    // Image/GIF fallbacks
    staticUrl: "/images/still.gif",
    listeningUrl: "/images/listening.gif",
    speakingUrl: "/images/speaking.gif",
    tapUrl: "/images/start.gif",

    // Optional video sources (use .mp4/.webm if available). If not provided, UI will fall back to images above
    backgroundVideoUrl: undefined as string | undefined,
    speakingVideoUrl: undefined as string | undefined,
    listeningVideoUrl: undefined as string | undefined,
  },
];

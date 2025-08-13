"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { useConversationStorage } from "@/hooks/useConversationStorage";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];
  const { getConversationId, setConversationId } = useConversationStorage();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Touch keys to ensure they exist
    ["chat_en_sessionId", "chat_ja_sessionId"].forEach(() => {});
  }, []);

  const changeLanguage = async (locale: string) => {
    if (typeof window === "undefined") return;
    
    // Get stored conversation ID for the target locale
    let targetSessionId = getConversationId(locale);

    // If we're currently on a chat route, ensure we navigate to a session id for the new locale
    const parts = pathname.split("/").filter(Boolean); // [locale, maybe 'chat', maybe id]
    const isChatRoute = parts[1] === "chat";

    if (isChatRoute && !targetSessionId) {
      try {
        // Show a lightweight loading state via URL hash (optional)
        router.push(`#loading-${locale}`);
        // Use seeded user data - randomly pick John from Tokyo or Aiko from Osaka
        const seededUsers = [
          { name: 'John', city: 'Tokyo' },
          { name: 'Aiko', city: 'Osaka' }
        ];
        const userData = seededUsers[Math.floor(Math.random() * seededUsers.length)];
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session`, {
          avatarId: 1,
          userData,
        });
        targetSessionId = response.data.sessionId;
        setConversationId(locale, targetSessionId);
      } catch (e) {
        console.error('Failed to create session for language switch:', e);
        targetSessionId = "";
      }
    }

    // Build destination path
    let newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    if (isChatRoute) {
      const id = targetSessionId || parts[2] || "";
      newPath = `/${locale}/chat/${id}`;
      
      // If we have a stored conversation ID, navigate with userData
      if (targetSessionId) {
        // Get current userData from URL or use default
        const currentUserData = { name: 'John', city: 'Tokyo' }; // Default fallback
        newPath += `?userData=${encodeURIComponent(JSON.stringify(currentUserData))}`;
      }
    }
    router.push(newPath);
  };

  return (
    <div className="glass-card p-2 flex gap-2 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-white/60 text-sm font-medium">Language:</span>
      </div>
      
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentLocale === "en" 
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        EN
      </button>
      
      <button
        onClick={() => changeLanguage("ja")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentLocale === "ja" 
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        JP
      </button>
    </div>
  );
}

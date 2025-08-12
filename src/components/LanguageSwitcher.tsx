"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  const changeLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
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

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
    <div className="fixed top-4 left-4 flex gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-2 py-1 ${
          currentLocale === "en" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("ja")}
        className={`px-2 py-1 ${
          currentLocale === "ja" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        日本語
      </button>
    </div>
  );
}

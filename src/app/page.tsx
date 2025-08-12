"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { avatars } from "@/lib/avatars";

export default function Home() {
  const router = useRouter();
  const [tappedAvatar, setTappedAvatar] = useState<number | null>(null);

  const handleAvatarTap = async (avatarId: number) => {
    setTappedAvatar(avatarId);
    try {
      const userData = { name: "User", city: "Unknown" }; // Hardcoded for MVP
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session`,
        { avatarId, userData }
      );
      setTimeout(() => {
        router.push(
          `/chat/${response.data.sessionId}?userData=${encodeURIComponent(
            JSON.stringify(userData)
          )}`
        );
      }, 2000);
    } catch (error) {
      console.error("Failed to create session:", error);
      setTappedAvatar(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl mb-8">Tap an Avatar to Chat</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleAvatarTap(avatar.id)}
          >
            <Image
              src={
                tappedAvatar === avatar.id
                  ? avatar.tapUrl || avatar.staticUrl
                  : avatar.staticUrl
              }
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

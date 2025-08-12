"use client";

import { useEffect, useState } from "react";

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-md">
      {message}
      <button onClick={() => setVisible(false)} className="ml-4 font-bold">
        ×
      </button>
    </div>
  );
}

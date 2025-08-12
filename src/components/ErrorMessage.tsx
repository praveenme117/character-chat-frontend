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
    <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in-up">
      <div className="glass-card border-red-400/30 bg-red-500/10 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-red-100 font-semibold text-sm mb-1">Error</h4>
            <p className="text-red-200 text-sm leading-relaxed">{message}</p>
          </div>
          
          <button 
            onClick={() => setVisible(false)} 
            className="flex-shrink-0 text-red-200 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-red-400/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-red-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-400 to-red-300 animate-pulse" 
            style={{ 
              animation: 'shrink 5s linear forwards',
              width: '100%'
            }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

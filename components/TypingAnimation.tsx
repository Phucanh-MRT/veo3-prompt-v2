import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }
  }, [text, speed]);

  return (
    <div className="text-center p-8 bg-white/50 dark:bg-[#1a1a40]/20 border border-slate-300 dark:border-[#b9f2ff]/10 rounded-lg">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-pulse bg-sky-500 dark:bg-[#b9f2ff] rounded-full h-3 w-3 mr-3"></div>
        <h3 className="text-xl font-orbitron text-slate-900 dark:text-white">Đang đạo diễn AI...</h3>
      </div>
      <p className="text-slate-600 dark:text-[#b9f2ff]/80 max-w-lg mx-auto whitespace-pre-wrap">
        {displayedText}
        <span className="animate-ping">_</span>
      </p>
    </div>
  );
};
import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="py-4 px-8 border-b border-slate-200 dark:border-[#1a1a40] bg-white/50 dark:bg-[#0d0d0d]/50 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="text-3xl font-bold font-anton tracking-widest uppercase text-slate-800 dark:text-[#b9f2ff]">
            VEO 3 <span className="text-sky-500 dark:text-white">Prompt Director</span>
            </div>
            <div className="hidden md:block text-sm font-light uppercase tracking-widest text-slate-500 dark:text-[#b9f2ff]/70 border-l border-slate-300 dark:border-[#b9f2ff]/20 pl-4">
            Viết Kịch Bản. Đạo Diễn AI.
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#b9f2ff]/10 text-slate-600 dark:text-[#b9f2ff]/70 hover:text-sky-600 dark:hover:text-[#b9f2ff] transition-all duration-300"
                title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>

            <button 
                onClick={onOpenSettings}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#b9f2ff]/10 text-slate-600 dark:text-[#b9f2ff]/70 hover:text-sky-600 dark:hover:text-[#b9f2ff] transition-all duration-300"
                title="Cài đặt API Key"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};
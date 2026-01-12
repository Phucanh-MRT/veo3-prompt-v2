import React, { useState, useEffect } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY_API = 'VEO_API_KEY';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY_API, apiKey.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_API);
    }
    setSaved(true);
    setTimeout(() => {
        setSaved(false);
        onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a40] border border-slate-200 dark:border-[#b9f2ff]/20 rounded-xl p-6 w-full max-w-md shadow-2xl dark:shadow-[0_0_50px_rgba(185,242,255,0.1)]">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 dark:border-[#b9f2ff]/10 pb-4">
            <div className="p-2 bg-sky-100 dark:bg-[#b9f2ff]/10 rounded-full">
                <SettingsIcon className="w-6 h-6 text-sky-500 dark:text-[#b9f2ff]" />
            </div>
            <h2 className="text-xl font-anton uppercase tracking-wider text-slate-900 dark:text-white">Cài đặt API Key</h2>
        </div>

        <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-[#b9f2ff]/70 leading-relaxed">
                Để sử dụng ứng dụng này, bạn cần cung cấp API Key Google Gemini của riêng mình. Key sẽ được lưu trong trình duyệt (LocalStorage) của bạn và không bao giờ được gửi đi đâu khác ngoài Google.
            </p>
            
            <div>
                <label className="block text-xs font-anton uppercase tracking-wider text-slate-500 dark:text-[#b9f2ff]/60 mb-2">
                    Google Gemini API Key
                </label>
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Nhập API Key bắt đầu bằng AIza..."
                    className="w-full bg-slate-50 dark:bg-[#0d0d0d] border border-slate-300 dark:border-[#b9f2ff]/30 rounded-lg p-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-[#b9f2ff] focus:ring-1 focus:ring-sky-500 dark:focus:ring-[#b9f2ff] transition-all outline-none"
                />
            </div>

            <div className="pt-2">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-sky-600 dark:text-[#b9f2ff] hover:underline"
                >
                    Lấy API Key tại Google AI Studio &rarr;
                </a>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-[#b9f2ff]/10">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-slate-500 dark:text-[#b9f2ff]/70 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    Hủy
                </button>
                <button 
                    onClick={handleSave}
                    className="bg-sky-500 dark:bg-[#b9f2ff] text-white dark:text-[#0d0d0d] font-bold px-6 py-2 rounded-lg hover:bg-sky-600 dark:hover:bg-white transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                    <span>{saved ? 'Đã lưu!' : 'Lưu cài đặt'}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
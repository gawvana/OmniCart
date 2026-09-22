import React from 'react';
import { useTranslation } from 'react-i18next';

export const ProfilePage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('profile', 'Profile')}</h1>
      
      <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 mb-4 flex items-center justify-center text-white text-3xl font-bold">
          U
        </div>
        <h2 className="text-xl font-bold">User Name</h2>
        <p className="text-gray-500">@username</p>
      </div>

      <div className="space-y-2">
        {['History', 'Analytics', 'Family', 'Settings'].map(item => (
          <div key={item} className="p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
            <span className="font-medium">{t(item.toLowerCase(), item)}</span>
            <span className="text-gray-400">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

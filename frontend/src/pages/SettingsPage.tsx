import React from 'react';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('settings', 'Settings')}</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm">
          <h3 className="font-semibold mb-3">{t('language', 'Language')}</h3>
          <div className="flex gap-2">
            {['en', 'ru', 'uz'].map(lang => (
              <button 
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`flex-1 py-2 rounded-xl transition ${i18n.language === lang ? 'bg-primary text-white' : 'bg-white/50 text-gray-700'}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm">
          <h3 className="font-semibold mb-3">{t('theme', 'Theme')}</h3>
          <div className="flex justify-between items-center">
            <span>{t('darkMode', 'Dark Mode')}</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

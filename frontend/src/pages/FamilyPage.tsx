import React from 'react';
import { useTranslation } from 'react-i18next';

export const FamilyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('family', 'Family')}</h1>
      
      <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center text-2xl">👨‍👩‍👧‍👦</div>
        <h2 className="text-lg font-bold mb-2">{t('createFamily', 'Create a Family')}</h2>
        <p className="text-gray-500 text-sm mb-4">{t('familyDesc', 'Share lists and manage budget together.')}</p>
        <button className="w-full py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/30">
          {t('startNow', 'Start Now')}
        </button>
      </div>
    </div>
  );
};

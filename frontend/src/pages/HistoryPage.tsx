import React from 'react';
import { useTranslation } from 'react-i18next';
export const HistoryPage = () => {
  const { t } = useTranslation();
  return <div className="p-4 min-h-screen"><h1 className="text-2xl font-bold">{t('history', 'History')}</h1></div>;
};

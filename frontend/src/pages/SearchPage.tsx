import React from 'react';
import { useTranslation } from 'react-i18next';
export const SearchPage = () => {
  const { t } = useTranslation();
  return <div className="p-4 min-h-screen"><input type="search" placeholder={t('search', 'Search')} className="w-full p-3 rounded-xl bg-white/60" /></div>;
};

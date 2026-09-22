import React from 'react';
import { useTranslation } from 'react-i18next';

export const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('analytics', 'Analytics')}</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm">
          <p className="text-sm text-gray-500">{t('totalSpent', 'Total Spent')}</p>
          <p className="text-2xl font-bold text-gray-800">$124.50</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm">
          <p className="text-sm text-gray-500">{t('itemsBought', 'Items Bought')}</p>
          <p className="text-2xl font-bold text-gray-800">42</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm mb-6 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400">Chart Placeholder</p>
      </div>
    </div>
  );
};

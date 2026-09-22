import React from 'react';
import { useTranslation } from 'react-i18next';

export const BudgetPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('budget', 'Budget')}</h1>
      
      <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-gray-500">{t('spent', 'Spent')}</p>
            <p className="text-3xl font-bold text-gray-800">$450</p>
          </div>
          <p className="text-sm text-gray-500">/ $1000</p>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-500 w-[45%]"></div>
        </div>
      </div>
    </div>
  );
};

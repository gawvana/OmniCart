import React from 'react';
import { useTranslation } from 'react-i18next';

export const AIPlanResult = ({ plan, onAddAll }: { plan: any, onAddAll: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm">
      <h3 className="font-bold text-lg mb-4">{t('aiPlan', 'AI Shopping Plan')}</h3>
      {plan?.items?.map((item: any, i: number) => (
        <div key={i} className="flex justify-between py-2 border-b border-white/40 last:border-0">
          <span>{item.name}</span>
          <span className="text-gray-500">{item.quantity} {item.unit}</span>
        </div>
      ))}
      <button onClick={onAddAll} className="w-full mt-4 py-2 bg-purple-500 text-white rounded-xl font-medium shadow-md shadow-purple-500/30">
        {t('addAll', 'Add All')}
      </button>
    </div>
  );
};

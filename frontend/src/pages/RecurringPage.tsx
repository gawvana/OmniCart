import React from 'react';
import { useTranslation } from 'react-i18next';
export const RecurringPage = () => {
  const { t } = useTranslation();
  return <div className="p-4 min-h-screen"><h1 className="text-2xl font-bold">{t('recurring', 'Recurring')}</h1></div>;
};

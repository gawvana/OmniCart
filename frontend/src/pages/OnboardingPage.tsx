import React from 'react';
import { useTranslation } from 'react-i18next';
export const OnboardingPage = () => {
  const { t } = useTranslation();
  return <div className="p-8 min-h-screen flex flex-col justify-center items-center"><h1 className="text-3xl font-bold mb-4">{t('welcome', 'Welcome')}</h1><button className="px-6 py-3 bg-primary text-white rounded-xl">{t('getStarted', 'Get Started')}</button></div>;
};

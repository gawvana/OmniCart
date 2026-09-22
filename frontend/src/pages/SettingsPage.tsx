import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '../api/settings';
import { LanguagePicker } from '../features/settings/LanguagePicker';
import { ThemeToggle } from '../features/settings/ThemeToggle';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [currency, setCurrency] = useState('UZS');
  const [notifications, setNotifications] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        if (data) {
          if (data.theme) setTheme(data.theme);
          if (data.currency) setCurrency(data.currency);
          if (data.notifications_enabled !== undefined) setNotifications(data.notifications_enabled);
          if (data.ai_enabled !== undefined) setAiEnabled(data.ai_enabled);
          if (data.language) i18n.changeLanguage(data.language);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    loadSettings();
  }, [i18n]);

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    try {
      await settingsApi.update({ language: lang });
      setToastMsg('Язык интерфейса обновлён');
      setTimeout(() => setToastMsg(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    try {
      await settingsApi.update({ theme: newTheme });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCurrencyChange = async (curr: string) => {
    setCurrency(curr);
    try {
      await settingsApi.update({ currency: curr });
      setToastMsg(`Основная валюта: ${curr}`);
      setTimeout(() => setToastMsg(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    const nextVal = !notifications;
    setNotifications(nextVal);
    try {
      await settingsApi.update({ notifications_enabled: nextVal });
    } catch (err) {
      console.error(err);
    }
  };

  const currencies = ['UZS', 'USD', 'RUB', 'EUR'];

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t('settings', 'Настройки')}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Персонализация и параметры приложения
        </p>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
          <AppIcon name="check" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Language Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          {t('language', 'Язык интерфейса')}
        </h3>
        <LanguagePicker
          currentLanguage={i18n.language || 'ru'}
          onChange={handleLanguageChange}
        />
      </div>

      {/* Theme Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          {t('theme', 'Тема оформления')}
        </h3>
        <ThemeToggle currentTheme={theme} onChange={handleThemeChange} />
      </div>

      {/* Currency Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Основная валюта
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {currencies.map((curr) => {
            const isSelected = currency === curr;
            return (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-800 hover:bg-white'
                }`}
              >
                {curr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Уведомления и AI
        </h3>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Telegram уведомления
              </p>
              <p className="text-[11px] text-zinc-400">
                Напоминания о покупках и активности семьи
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleToggleNotifications}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                AI Умные подсказки
              </p>
              <p className="text-[11px] text-zinc-400">
                Авто-категоризация и предсказание пополнения
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={() => setAiEnabled(!aiEnabled)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-4 text-xs text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-500 dark:text-zinc-400">OmniCart AI 2.0</p>
        <p className="text-[11px]">Production Rebuild • Telegram Mini App</p>
      </div>
    </div>
  );
};

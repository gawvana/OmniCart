import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '../api/settings';
import { LanguagePicker } from '../features/settings/LanguagePicker';
import { ThemeToggle } from '../features/settings/ThemeToggle';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { LiquidCheckbox } from '@/design-system/components/LiquidCheckbox';

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

  const handleToggleAi = async () => {
    const nextVal = !aiEnabled;
    setAiEnabled(nextVal);
    try {
      await settingsApi.update({ ai_enabled: nextVal });
    } catch (err) {
      console.error(err);
    }
  };

  const currencies = ['UZS', 'USD', 'RUB', 'EUR'];

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t('settings', 'Настройки')}
        </h1>
        <p className="text-xs text-slate-400">
          Персонализация и параметры приложения
        </p>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 backdrop-blur-xl shadow-lg animate-fadeIn">
          <AppIcon name="check" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Language Section */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          {t('language', 'Язык интерфейса')}
        </h3>
        <LanguagePicker
          currentLanguage={i18n.language || 'ru'}
          onChange={handleLanguageChange}
        />
      </div>

      {/* Theme Section */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          {t('theme', 'Тема оформления')}
        </h3>
        <ThemeToggle currentTheme={theme} onChange={handleThemeChange} />
      </div>

      {/* Currency Section */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Основная валюта
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {currencies.map((curr) => {
            const isSelected = currency === curr;
            return (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'liquid-glass-elevated border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/20'
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
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Уведомления и AI
        </h3>
        <LiquidCard variant="subtle" padding="none" className="divide-y divide-white/[0.06] overflow-hidden">
          <div
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={handleToggleNotifications}
          >
            <div>
              <p className="text-xs font-medium text-white">
                Telegram уведомления
              </p>
              <p className="text-[11px] text-slate-400">
                Напоминания о покупках и активности семьи
              </p>
            </div>
            <LiquidCheckbox
              checked={notifications}
              onChange={handleToggleNotifications}
              size="sm"
            />
          </div>

          <div
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={handleToggleAi}
          >
            <div>
              <p className="text-xs font-medium text-white">
                AI Умные подсказки
              </p>
              <p className="text-[11px] text-slate-400">
                Авто-категоризация и предсказание пополнения
              </p>
            </div>
            <LiquidCheckbox
              checked={aiEnabled}
              onChange={handleToggleAi}
              size="sm"
            />
          </div>
        </LiquidCard>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-4 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">OmniCart AI 2.0</p>
        <p className="text-[11px]">Production Rebuild • Telegram Mini App</p>
      </div>
    </div>
  );
};

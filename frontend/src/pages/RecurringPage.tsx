import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recurringApi } from '../api/recurring';
import { RecurringCard } from '../features/recurring/RecurringCard';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const RecurringPage = () => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const data = await recurringApi.getSuggestions();
      if (Array.isArray(data)) {
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      await recurringApi.calculate();
      await fetchSuggestions();
      setToastMsg('Регулярные покупки пересчитаны');
      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      console.error('Failed to calculate', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAccept = async (id: string, name: string) => {
    try {
      await recurringApi.accept(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      setToastMsg(`"${name}" добавлен в список покупок`);
      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await recurringApi.dismiss(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('recurring', 'Умный повтор')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Предиктивное пополнение запасов
          </p>
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <AppIcon name="repeat" size={14} />
          <span>{isCalculating ? 'Расчёт...' : 'Анализ'}</span>
        </button>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
          <AppIcon name="check" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 backdrop-blur-md flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
          <AppIcon name="sparkles" size={18} />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          OmniCart AI автоматически анализирует ваши регулярные покупки (молоко, хлеб, вода) и напоминает пополнить запасы в нужный день.
        </p>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          <div className="h-28 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
            <AppIcon name="repeat" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Нет активных напоминаний
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Совершите несколько покупок, чтобы AI выявил ваши регулярные интервалы
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <RecurringCard
              key={s.id}
              id={s.id}
              name={s.product_name}
              intervalDays={s.estimated_interval_days || 7}
              confidence={s.confidence || 0.8}
              nextDate={s.next_expected_at}
              onAccept={() => handleAccept(s.id, s.product_name)}
              onDismiss={() => handleDismiss(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

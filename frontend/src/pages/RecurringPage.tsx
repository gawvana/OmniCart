import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recurringApi } from '../api/recurring';
import { RecurringCard } from '../features/recurring/RecurringCard';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { PrimaryButton } from '@/design-system/components/GlassButton';

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
    <div className="p-4 space-y-4 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('recurring', 'Умный повтор')}
          </h1>
          <p className="text-xs text-slate-400">
            Предиктивное пополнение запасов
          </p>
        </div>

        <PrimaryButton
          size="sm"
          onClick={handleCalculate}
          loading={isCalculating}
          icon={<AppIcon name="sync" size={14} />}
        >
          {isCalculating ? 'Расчёт...' : 'Анализ'}
        </PrimaryButton>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 backdrop-blur-xl shadow-lg animate-fadeIn">
          <AppIcon name="check" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Info Banner */}
      <LiquidCard variant="elevated" padding="md" className="border-emerald-500/20 bg-emerald-500/[0.04]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <AppIcon name="sparkles" size={16} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            OmniCart AI автоматически анализирует ваши регулярные покупки (молоко, хлеб, вода) и напоминает пополнить запасы в нужный день.
          </p>
        </div>
      </LiquidCard>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />
          <div className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />
        </div>
      ) : suggestions.length === 0 ? (
        <LiquidCard variant="subtle" padding="lg" className="text-center py-12 space-y-2 border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] text-slate-400 mx-auto flex items-center justify-center">
            <AppIcon name="recurring" size={24} />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Нет активных напоминаний
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Совершите несколько покупок, чтобы AI выявил ваши регулярные интервалы
          </p>
        </LiquidCard>
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

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { budgetApi } from '../api/budget';
import { aiApi } from '../api/ai';
import { BudgetCard } from '../features/budget/BudgetCard';
import { AIBudgetSuggestions, SuggestionItem } from '../features/ai/AIBudgetSuggestions';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidModal } from '@/design-system/components/GlassModal';
import { GlassInput } from '@/design-system/components/GlassInput';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';

export const BudgetPage: React.FC = () => {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  // Edit/Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [nameInput, setNameInput] = useState('Месячный бюджет');
  const [periodInput, setPeriodInput] = useState('monthly');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const data = await budgetApi.get();
      if (Array.isArray(data)) {
        setBudgets(data);
      }
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await aiApi.budgetSuggestions({
        items: [],
        budget: 500000,
        currency: 'UZS',
      });
      if (res && res.suggestions) {
        setSuggestions(res.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch budget suggestions', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchSuggestions();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amountInput);
    if (!numAmount || numAmount <= 0) return;

    try {
      setIsSaving(true);
      await budgetApi.create({
        name: nameInput,
        amount: numAmount,
        currency: 'UZS',
        period: periodInput,
      });
      setIsModalOpen(false);
      setAmountInput('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to save budget', err);
    } finally {
      setIsSaving(false);
    }
  };

  const primaryBudget = budgets.length > 0 ? budgets[0] : null;

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('budget', 'Бюджет')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Контроль расходов и умные лимиты
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAmountInput(primaryBudget ? String(primaryBudget.amount) : '500000');
            setIsModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95"
        >
          <AppIcon name="plus" size={14} />
          <span>{primaryBudget ? 'Изменить' : 'Задать'}</span>
        </button>
      </header>

      {/* Main Budget Card */}
      {isLoading ? (
        <GlassSkeleton variant="card" height={160} />
      ) : primaryBudget ? (
        <BudgetCard
          name={primaryBudget.name || 'Семейный бюджет'}
          amount={primaryBudget.amount}
          spent={primaryBudget.spent_amount || 0}
          currency={primaryBudget.currency || 'UZS'}
          period={primaryBudget.period === 'monthly' ? 'В месяц' : 'В неделю'}
          onEdit={() => {
            setAmountInput(String(primaryBudget.amount));
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="p-6 rounded-3xl liquid-glass-subtle border border-white/[0.06] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <AppIcon name="budget" size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Бюджет не установлен</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Задайте целевой лимит на месяц, чтобы OmniCart предупреждал о перерасходе
            </p>
          </div>
          <PrimaryButton
            size="sm"
            onClick={() => {
              setAmountInput('500000');
              setIsModalOpen(true);
            }}
          >
            Установить бюджет
          </PrimaryButton>
        </div>
      )}

      {/* AI Budget Suggestions Section */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2 px-0.5">
          <AppIcon name="sparkles" size={15} className="text-emerald-400" />
          <h2 className="text-xs font-semibold text-slate-300 tracking-tight">
            AI Оптимизация расходов
          </h2>
        </div>
        <AIBudgetSuggestions suggestions={suggestions} currency="UZS" />
      </section>

      {/* Modal: Edit/Create Budget */}
      <LiquidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={primaryBudget ? 'Изменить бюджет' : 'Новый бюджет'}
        size="sm"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Название</label>
            <GlassInput
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Месячный бюджет"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Лимит (UZS)</label>
            <GlassInput
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="500000"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Период</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriodInput('monthly')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  periodInput === 'monthly'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'liquid-glass-subtle text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                Месяц
              </button>
              <button
                type="button"
                onClick={() => setPeriodInput('weekly')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  periodInput === 'weekly'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'liquid-glass-subtle text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                Неделя
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <SecondaryButton fullWidth onClick={() => setIsModalOpen(false)}>
              Отмена
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSaving || !amountInput}
              loading={isSaving}
              fullWidth
            >
              Сохранить
            </PrimaryButton>
          </div>
        </form>
      </LiquidModal>
    </div>
  );
};

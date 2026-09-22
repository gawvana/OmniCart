import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { budgetApi } from '../api/budget';
import { aiApi } from '../api/ai';
import { BudgetCard } from '../features/budget/BudgetCard';
import { AIBudgetSuggestions, SuggestionItem } from '../features/ai/AIBudgetSuggestions';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const BudgetPage = () => {
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
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('budget', 'Бюджет')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Контроль расходов и лимитов
          </p>
        </div>

        <button
          onClick={() => {
            setAmountInput(primaryBudget ? String(primaryBudget.amount) : '500000');
            setIsModalOpen(true);
          }}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <AppIcon name="plus" size={15} />
          <span>{primaryBudget ? 'Изменить' : 'Задать'}</span>
        </button>
      </header>

      {/* Main Budget Card */}
      {isLoading ? (
        <div className="h-44 bg-white/40 dark:bg-zinc-800/40 rounded-3xl animate-pulse" />
      ) : primaryBudget ? (
        <BudgetCard
          name={primaryBudget.name}
          amount={primaryBudget.amount}
          spent={primaryBudget.spent_amount || 0}
          currency={primaryBudget.currency || 'UZS'}
          period={primaryBudget.period === 'monthly' ? 'Месяц' : 'Неделя'}
          onEdit={() => {
            setAmountInput(String(primaryBudget.amount));
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-white/20 dark:border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <AppIcon name="wallet" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Бюджет ещё не установлен
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Установите лимит расходов на месяц, чтобы отслеживать траты на покупки
          </p>
          <button
            onClick={() => {
              setAmountInput('500000');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Установить бюджет
          </button>
        </div>
      )}

      {/* AI Budget Suggestions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            AI Рекомендации по экономии
          </h2>
        </div>

        <AIBudgetSuggestions
          suggestions={
            suggestions.length > 0
              ? suggestions
              : [
                  {
                    item_name: 'Сезонные продукты',
                    suggestion: 'Покупка местных сезонных овощей на рынке экономит до 20% бюджета.',
                    potential_savings: 45000,
                  },
                  {
                    item_name: 'Оптовые закупки',
                    suggestion: 'Базовые товары (рис, сахар, масло) выгоднее брать крупной фасовкой.',
                    potential_savings: 30000,
                  },
                ]
          }
          currency="UZS"
        />
      </section>

      {/* Modal: Set/Edit Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {primaryBudget ? 'Редактировать бюджет' : 'Установить бюджет'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 p-1">
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Сумма лимита (UZS)
                </label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="500000"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Период
                </label>
                <select
                  value={periodInput}
                  onChange={(e) => setPeriodInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                >
                  <option value="monthly">Ежемесячно</option>
                  <option value="weekly">Еженедельно</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

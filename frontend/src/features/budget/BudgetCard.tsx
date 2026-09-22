import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface BudgetCardProps {
  name?: string;
  amount: number;
  spent: number;
  currency?: string;
  period?: string;
  onEdit?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  name = 'Месячный бюджет',
  amount,
  spent,
  currency = 'UZS',
  period = 'Месяц',
  onEdit,
}) => {
  const percentage = amount > 0 ? Math.min(Math.round((spent / amount) * 100), 100) : 0;
  const remaining = Math.max(0, amount - spent);
  const isOverBudget = spent > amount;

  const getProgressColor = () => {
    if (isOverBudget || percentage > 90) return 'bg-rose-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/80 p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AppIcon name="wallet" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{period}</p>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <AppIcon name="edit" size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {spent.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5">
              / {amount.toLocaleString()} {currency}
            </span>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isOverBudget
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>
            {isOverBudget ? (
              <span className="text-rose-500 font-medium">Превышен на {(spent - amount).toLocaleString()} {currency}</span>
            ) : (
              <span>Осталось: <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{remaining.toLocaleString()} {currency}</strong></span>
            )}
          </span>
          <span>Лимит: {amount.toLocaleString()} {currency}</span>
        </div>
      </div>
    </div>
  );
};

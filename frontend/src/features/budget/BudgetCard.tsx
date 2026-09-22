import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';

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
    if (isOverBudget) return 'bg-rose-500/80';
    if (percentage > 85) return 'bg-amber-400/80';
    return 'bg-emerald-500';
  };

  return (
    <LiquidCard variant="elevated" padding="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <AppIcon name="budget" size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-xs tracking-tight">{name}</h3>
            <p className="text-[10px] text-slate-400 capitalize">{period}</p>
          </div>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Редактировать бюджет"
          >
            <AppIcon name="edit" size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold text-white tracking-tight">
              {spent.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 ml-1.5">
              / {amount.toLocaleString()} {currency}
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isOverBudget
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {percentage}%
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
          <span>
            {isOverBudget ? (
              <span className="text-rose-400 font-medium">
                Превышен на {(spent - amount).toLocaleString()} {currency}
              </span>
            ) : (
              <span>
                Осталось:{' '}
                <strong className="text-slate-200 font-semibold">
                  {remaining.toLocaleString()} {currency}
                </strong>
              </span>
            )}
          </span>
          <span>Лимит: {amount.toLocaleString()} {currency}</span>
        </div>
      </div>
    </LiquidCard>
  );
};

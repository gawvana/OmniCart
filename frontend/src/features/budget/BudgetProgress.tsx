import React from 'react';

export interface BudgetProgressProps {
  spent: number;
  total: number;
  currency?: string;
  className?: string;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  spent,
  total,
  currency = 'UZS',
  className = '',
}) => {
  const percentage = total > 0 ? Math.min(Math.round((spent / total) * 100), 100) : 0;
  const isOver = spent > total;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-slate-300">
          {spent.toLocaleString()} {currency}
        </span>
        <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}>
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isOver ? 'bg-rose-500/85' : percentage > 85 ? 'bg-amber-400/85' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

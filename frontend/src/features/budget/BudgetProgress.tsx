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
      <div className="flex justify-between text-xs font-medium">
        <span className="text-zinc-600 dark:text-zinc-300">
          {spent.toLocaleString()} {currency}
        </span>
        <span className={isOver ? 'text-rose-500 font-bold' : 'text-zinc-400'}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isOver ? 'bg-rose-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

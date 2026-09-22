import React from 'react';

export interface CategoryShare {
  category: string;
  amount: number;
  percentage: number;
}

export interface CategoryBreakdownProps {
  categories: CategoryShare[];
  currency?: string;
}

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  currency = 'UZS',
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-400 bg-white/40 dark:bg-zinc-900/40 rounded-xl">
        Нет данных по категориям
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 space-y-3">
      <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
        По категориям
      </h3>

      <div className="space-y-2.5">
        {categories.map((cat, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-700 dark:text-zinc-300">{cat.category}</span>
                <span className="text-zinc-900 dark:text-white font-semibold">
                  {cat.amount.toLocaleString()} {currency} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

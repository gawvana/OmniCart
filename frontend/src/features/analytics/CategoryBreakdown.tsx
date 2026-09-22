import React from 'react';
import { LiquidCard } from '@/design-system/components/GlassCard';

export interface CategoryShare {
  category: string;
  amount: number;
  percentage: number;
}

export interface CategoryBreakdownProps {
  categories: CategoryShare[];
  currency?: string;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  currency = 'UZS',
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 liquid-glass-subtle rounded-2xl border border-white/[0.06]">
        Нет данных по категориям
      </div>
    );
  }

  return (
    <LiquidCard variant="elevated" padding="md" className="space-y-3.5">
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
        По категориям
      </h3>

      <div className="space-y-3">
        {categories.map((cat, idx) => {
          // Cohesive emerald-to-graphite shading
          const barColor =
            idx === 0
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : idx === 1
              ? 'bg-emerald-600/80'
              : idx === 2
              ? 'bg-emerald-700/60'
              : 'bg-slate-600';

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 tracking-tight">{cat.category}</span>
                <span className="text-white font-semibold text-[11px]">
                  {cat.amount.toLocaleString()} {currency} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </LiquidCard>
  );
};

import React from 'react';
import { LiquidCard } from '@/design-system/components/GlassCard';

export interface DailySpending {
  date: string;
  amount: number;
}

export interface SpendingChartProps {
  data: DailySpending[];
  currency?: string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  currency = 'UZS',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400 liquid-glass-subtle rounded-2xl border border-white/[0.06]">
        Нет данных о расходах за выбранный период
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <LiquidCard variant="elevated" padding="md" className="space-y-4">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span className="font-semibold text-white tracking-tight">Динамика расходов</span>
        <span className="text-[11px]">Пик: {maxAmount.toLocaleString()} {currency}</span>
      </div>

      <div className="h-32 flex items-end justify-between gap-1.5 pt-2">
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.amount / maxAmount) * 100, 6);
          const dayLabel = item.date.slice(-2);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full relative flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[14px] bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </LiquidCard>
  );
};

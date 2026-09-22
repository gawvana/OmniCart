import React from 'react';

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
      <div className="h-44 flex items-center justify-center text-xs text-zinc-400 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
        Нет данных о расходах за выбранный период
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-4 space-y-4">
      <div className="flex justify-between items-center text-xs text-zinc-500">
        <span className="font-semibold text-zinc-900 dark:text-white">Динамика расходов</span>
        <span>Макс: {maxAmount.toLocaleString()} {currency}</span>
      </div>

      <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.amount / maxAmount) * 100, 4);
          const dayLabel = item.date.slice(-2);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full relative flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[18px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

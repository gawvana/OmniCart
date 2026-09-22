import React from 'react';
import { HistoryItem, HistoryItemData } from './HistoryItem';

export interface HistoryGroupProps {
  title: string;
  totalSpent?: number;
  currency?: string;
  items: HistoryItemData[];
  onReAdd?: (item: HistoryItemData) => void;
}

export const HistoryGroup: React.FC<HistoryGroupProps> = ({
  title,
  totalSpent,
  currency = 'UZS',
  items,
  onReAdd,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
        <span>{title}</span>
        {totalSpent !== undefined && totalSpent > 0 && (
          <span>{totalSpent.toLocaleString()} {currency}</span>
        )}
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1">
        {items.map((it) => (
          <HistoryItem key={it.id} item={it} onReAdd={onReAdd} />
        ))}
      </div>
    </div>
  );
};

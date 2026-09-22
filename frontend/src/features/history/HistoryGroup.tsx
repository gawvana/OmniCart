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
      <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        <span>{title}</span>
        {totalSpent !== undefined && totalSpent > 0 && (
          <span className="text-emerald-400 font-medium">{totalSpent.toLocaleString()} {currency}</span>
        )}
      </div>
      <div className="divide-y divide-white/[0.04] rounded-2xl liquid-glass-subtle border border-white/[0.06] p-1.5">
        {items.map((it) => (
          <HistoryItem key={it.id} item={it} onReAdd={onReAdd} />
        ))}
      </div>
    </div>
  );
};

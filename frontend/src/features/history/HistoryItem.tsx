import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface HistoryItemData {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  purchased_at?: string;
}

export interface HistoryItemProps {
  item: HistoryItemData;
  onReAdd?: (item: HistoryItemData) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onReAdd }) => {
  return (
    <div className="py-2.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <AppIcon name="check" size={13} strokeWidth={2.5} />
        </div>
        <div className="truncate">
          <p className="font-semibold text-zinc-900 dark:text-white truncate">{item.name}</p>
          <p className="text-[11px] text-zinc-400">
            {item.quantity || 1} {item.unit || 'шт'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {item.price && (
          <span className="font-bold text-zinc-900 dark:text-white">
            {item.price.toLocaleString()} {item.currency || 'UZS'}
          </span>
        )}
        {onReAdd && (
          <button
            onClick={() => onReAdd(item)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
            title="Добавить снова"
          >
            <AppIcon name="plus" size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

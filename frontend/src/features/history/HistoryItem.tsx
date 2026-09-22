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
    <div className="py-2.5 px-3 rounded-xl liquid-glass-subtle border border-white/[0.04] hover:border-white/10 transition-all flex items-center justify-between gap-3 text-xs select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <AppIcon name="check" size={12} strokeWidth={2.5} />
        </div>
        <div className="truncate">
          <p className="font-medium text-white truncate tracking-tight">{item.name}</p>
          <p className="text-[10px] text-slate-400">
            {item.quantity || 1} {item.unit || 'шт'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {item.price ? (
          <span className="font-semibold text-emerald-400 text-xs">
            {item.price.toLocaleString()} {item.currency || 'UZS'}
          </span>
        ) : null}
        {onReAdd && (
          <button
            type="button"
            onClick={() => onReAdd(item)}
            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all"
            title="Добавить снова"
          >
            <AppIcon name="plus" size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

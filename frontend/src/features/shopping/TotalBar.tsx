import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { ShoppingItem } from '../../types';

interface TotalBarProps {
  items: ShoppingItem[];
}

export const TotalBar: React.FC<TotalBarProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.isPurchased).length;
  const totalCost = items.reduce((sum, item) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : (parseFloat(String(item.quantity)) || 1);
    const price = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price)) || 0);
    return sum + (price * qty);
  }, 0);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <aside aria-label="Total cost bar" className="fixed bottom-[74px] left-0 right-0 z-20 px-4 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto p-3.5 rounded-2xl liquid-glass border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <AppIcon name="wallet" size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white tracking-tight">Итого</span>
              <span className="text-[10px] font-medium text-slate-400">
                ({completedCount} из {totalCount})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-emerald-400 tracking-tight">
            {totalCost > 0 ? `${totalCost.toLocaleString('ru-RU')} UZS` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {progressPercent}% куплено
          </div>
        </div>
      </div>
    </aside>
  );
};

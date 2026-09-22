import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingItem as IShoppingItem } from '../../types';
import { LiquidCheckbox } from '@/design-system/components/LiquidCheckbox';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { cn } from '@/utils/cn';

export const ShoppingItem: React.FC<{
  item: IShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ item, onToggle, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative p-3 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3 select-none',
        item.isPurchased && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <LiquidCheckbox
          checked={Boolean(item.isPurchased)}
          onChange={() => onToggle(item.id)}
          ariaLabel={`Mark ${item.name} as purchased`}
        />
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm font-medium tracking-tight truncate transition-colors',
              item.isPurchased ? 'line-through text-slate-400' : 'text-slate-100'
            )}
          >
            {item.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
            <span>
              {item.quantity} {item.unit || 'шт'}
            </span>
            {item.price ? (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium">{item.price} UZS</span>
              </>
            ) : null}
            {item.category && item.category !== 'Другое' ? (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{item.category}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label="Delete item"
        className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all opacity-70 group-hover:opacity-100"
      >
        <AppIcon name="trash" size={15} />
      </button>
    </motion.div>
  );
};

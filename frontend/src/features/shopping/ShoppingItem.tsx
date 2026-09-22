import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingItem as IShoppingItem } from '../../types';
import { LiquidCheckbox } from '@/design-system/components/LiquidCheckbox';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/utils/cn';

interface ShoppingItemProps {
  item: IShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQty?: (id: string, newQty: number) => void;
}

const SWIPE_THRESHOLD = -75;

export const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onToggle,
  onDelete,
  onUpdateQty,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const { hapticFeedback } = useTelegram();

  const rawQty = typeof item.quantity === 'number' ? item.quantity : (parseFloat(String(item.quantity)) || 1);
  const price = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price)) || 0);
  const unitLabel = item.unit || 'шт';
  const lineTotal = price * rawQty;

  const handleToggle = () => {
    try {
      hapticFeedback.impactOccurred('medium');
    } catch {}
    onToggle(item.id);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    // Allow only swiping left, clamp at -100px
    setOffsetX(Math.max(Math.min(diff, 0), -100));
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (offsetX < SWIPE_THRESHOLD) {
      try {
        hapticFeedback.notificationOccurred('warning');
      } catch {}
      onDelete(item.id);
    }
    setOffsetX(0);
  }, [offsetX, onDelete, item.id, hapticFeedback]);

  const deleteRevealed = offsetX < SWIPE_THRESHOLD / 2;

  return (
    <div className="relative overflow-hidden rounded-2xl select-none group">
      {/* Background delete action revealed on swipe */}
      <div
        className={cn(
          'absolute inset-0 bg-rose-600/90 flex items-center justify-end px-5 rounded-2xl text-white transition-opacity',
          deleteRevealed ? 'opacity-100' : 'opacity-0'
        )}
      >
        <AppIcon name="trash" size={18} />
      </div>

      {/* Foreground item card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, x: offsetX }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={isSwiping ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 28 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'relative p-3 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between gap-3',
          item.isPurchased && 'opacity-50'
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <LiquidCheckbox
            checked={Boolean(item.isPurchased)}
            onChange={handleToggle}
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
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 flex-wrap">
              <span className="font-medium text-slate-300">
                {rawQty} {unitLabel}
              </span>
              {price > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">
                    {lineTotal.toLocaleString('ru-RU')} UZS
                  </span>
                </>
              )}
              {item.category && item.category !== 'Другое' && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{item.category}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quantity quick stepper (if active and onUpdateQty provided) */}
        {!item.isPurchased && onUpdateQty && (
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, Math.max(0.5, rawQty - 1))}
              className="w-5 h-5 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white active:scale-95"
            >
              -
            </button>
            <span className="text-[11px] font-semibold text-slate-200 px-1">{rawQty}</span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, rawQty + 1)}
              className="w-5 h-5 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white active:scale-95"
            >
              +
            </button>
          </div>
        )}

        {/* Delete button for desktop / click */}
        <button
          type="button"
          onClick={() => {
            try {
              hapticFeedback.impactOccurred('light');
            } catch {}
            onDelete(item.id);
          }}
          aria-label="Delete item"
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all opacity-70 group-hover:opacity-100"
        >
          <AppIcon name="trash" size={15} />
        </button>
      </motion.div>
    </div>
  );
};

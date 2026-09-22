import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { cn } from '@/utils/cn';

export interface AddItemData {
  name: string;
  quantity?: number;
  unit?: string;
  price?: number;
  category?: string;
}

export const AddItemInput: React.FC<{
  onAdd: (data: AddItemData) => void;
  onAiParse: (text: string) => void;
  isLoading?: boolean;
}> = ({ onAdd, onAiParse, isLoading = false }) => {
  const [text, setText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('шт');
  const [price, setPrice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const QUICK_CHIPS = ['Хлеб', 'Молоко', 'Яйца', 'Сыр', 'Вода', 'Яблоки', 'Бананы', 'Кофе'];
  const UNITS = ['шт', 'кг', 'л', 'упак', 'г'];

  const handleSubmit = useCallback(() => {
    const raw = text.trim();
    if (!raw) return;

    let finalName = raw;
    let finalPrice = price ? (parseFloat(price) || undefined) : undefined;
    let finalQty = parseFloat(quantity) || 1;
    let finalUnit = unit;

    // Smart regex parsing if user didn't explicitly open and fill advanced price/qty
    if (!showAdvanced) {
      // 1. Check for trailing price: "30000", "25 000 сум", "15000uzs"
      const priceMatch = finalName.match(/(?:^|\s)(\d[\d\s]{2,})\s*(?:сум|sum|uzs)?$/i);
      if (priceMatch && priceMatch.index !== undefined) {
        const rawP = priceMatch[1].replace(/\s+/g, '');
        const numP = parseInt(rawP, 10);
        if (!isNaN(numP) && numP >= 50) {
          finalPrice = numP;
          finalName = finalName.slice(0, priceMatch.index).trim();
        }
      }

      // 2. Check for qty and unit: "2 кг", "1.5 л", "3 шт", "500 г", "2 упак"
      const qtyMatch = finalName.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(кг|шт|л|упак|г|kg|l|g)\b/i);
      if (qtyMatch && qtyMatch.index !== undefined) {
        finalQty = parseFloat(qtyMatch[1].replace(',', '.'));
        const u = qtyMatch[2].toLowerCase();
        if (u === 'кг' || u === 'kg') finalUnit = 'кг';
        else if (u === 'л' || u === 'l') finalUnit = 'л';
        else if (u === 'упак') finalUnit = 'упак';
        else if (u === 'г' || u === 'g') finalUnit = 'г';
        else finalUnit = 'шт';

        finalName = (finalName.slice(0, qtyMatch.index) + ' ' + finalName.slice(qtyMatch.index + qtyMatch[0].length)).trim();
      }
    }

    if (!finalName) finalName = raw;

    onAdd({
      name: finalName,
      quantity: finalQty,
      unit: finalUnit,
      price: finalPrice,
    });

    setText('');
    setPrice('');
    setQuantity('1');
    setUnit('шт');
    setShowAdvanced(false);
  }, [text, price, quantity, unit, showAdvanced, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const adjustQty = (delta: number) => {
    const cur = parseFloat(quantity) || 1;
    const next = Math.max(0.5, cur + delta);
    setQuantity(String(next));
  };

  return (
    <div className="space-y-2">
      {/* Main input bar */}
      <div className="p-1.5 liquid-glass-subtle border border-white/[0.08] rounded-2xl flex items-center gap-1.5 shadow-lg shadow-black/20 focus-within:border-emerald-500/40 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('addItemPlaceholder', 'Например: Яблоки 2 кг 25000...')}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm px-3 min-h-[44px]"
        />

        {/* Advanced details toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Параметры (кол-во, цена, единица)"
          className={cn(
            'p-2.5 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center',
            showAdvanced
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          )}
        >
          <AppIcon name="filter" size={17} />
        </button>

        {/* AI Parse button */}
        <button
          type="button"
          onClick={() => {
            if (text.trim()) {
              onAiParse(text.trim());
              setText('');
            }
          }}
          disabled={isLoading}
          title={t('ai.parseTitle', 'Распознать с помощью AI')}
          className={cn(
            'p-2.5 rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center',
            isLoading && 'animate-pulse'
          )}
        >
          <AppIcon name="sparkles" size={17} />
        </button>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          title={t('common.add', 'Добавить')}
          className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shadow-md shadow-emerald-950/40"
        >
          <AppIcon name="plus" size={17} />
        </button>
      </div>

      {/* Advanced Drawer */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-2xl liquid-glass-subtle border border-white/[0.08] space-y-3">
              {/* Units pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Единица:</span>
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                      unit === u
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-950/40'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>

              {/* Quantity Stepper & Price Row */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* Stepper */}
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => adjustQty(-1)}
                    className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-14 bg-transparent text-center text-white text-xs font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => adjustQty(1)}
                    className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold active:scale-95"
                  >
                    +
                  </button>
                </div>

                {/* Price input */}
                <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <input
                    type="number"
                    placeholder="Цена"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent text-white text-xs placeholder:text-slate-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-medium ml-1">UZS</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-1 tracking-wider">
          Быстро:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onAdd({ name: chip, quantity: 1, unit: 'шт' })}
            className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.03] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-slate-300 border border-white/[0.06] transition-all whitespace-nowrap active:scale-95 shrink-0"
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

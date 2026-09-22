import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface PlanCategory {
  category: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    estimated_price?: number;
  }>;
}

export interface AIPlanResultProps {
  planName: string;
  totalEstimatedCost?: number;
  currency?: string;
  categories: PlanCategory[];
  onAddAll?: () => void;
  isLoading?: boolean;
}

export const AIPlanResult: React.FC<AIPlanResultProps> = ({
  planName,
  totalEstimatedCost,
  currency = 'UZS',
  categories,
  onAddAll,
  isLoading = false,
}) => {
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <AppIcon name="sparkles" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{planName}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {totalItems} товаров в плане
              </p>
            </div>
          </div>
          {totalEstimatedCost && (
            <div className="text-right">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                ~{totalEstimatedCost.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 ml-1">{currency}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-3.5 space-y-2"
          >
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              {cat.category}
            </h4>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="py-1.5 flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">
                      {item.quantity} {item.unit}
                    </span>
                    {item.estimated_price && (
                      <span className="text-zinc-500 font-semibold">
                        {item.estimated_price.toLocaleString()} {currency}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {onAddAll && (
        <button
          onClick={onAddAll}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <AppIcon name="plus" size={16} />
          <span>{isLoading ? 'Добавление...' : 'Добавить все товары в список'}</span>
        </button>
      )}
    </div>
  );
};

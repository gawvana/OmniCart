import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { PrimaryButton } from '@/design-system/components/GlassButton';

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
      <div className="p-4 rounded-2xl liquid-glass-green border border-emerald-500/25 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <AppIcon name="sparkles" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm tracking-tight">{planName}</h3>
              <p className="text-[11px] text-emerald-300/80">
                {totalItems} товаров в сгенерированном меню
              </p>
            </div>
          </div>
          {totalEstimatedCost ? (
            <div className="text-right">
              <span className="text-sm font-bold text-white">
                ~{totalEstimatedCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 ml-1 font-medium">{currency}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="rounded-2xl liquid-glass-subtle border border-white/[0.06] p-3.5 space-y-2"
          >
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              {cat.category}
            </h4>
            <div className="divide-y divide-white/[0.04]">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="py-1.5 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {item.quantity} {item.unit}
                    </span>
                    {item.estimated_price ? (
                      <span className="text-emerald-400 font-medium">
                        {item.estimated_price.toLocaleString()} {currency}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {onAddAll && (
        <PrimaryButton
          onClick={onAddAll}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
          icon={<AppIcon name="plus" size={16} />}
        >
          {isLoading ? 'Добавление...' : 'Добавить все товары в список'}
        </PrimaryButton>
      )}
    </div>
  );
};

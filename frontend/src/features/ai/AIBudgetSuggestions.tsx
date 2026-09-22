import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface SuggestionItem {
  item_name: string;
  suggestion: string;
  potential_savings: number;
}

export interface AIBudgetSuggestionsProps {
  suggestions: SuggestionItem[];
  currency?: string;
  onApply?: (suggestion: SuggestionItem) => void;
}

export const AIBudgetSuggestions: React.FC<AIBudgetSuggestionsProps> = ({
  suggestions,
  currency = 'UZS',
  onApply,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-4 rounded-2xl liquid-glass-subtle text-center text-xs text-slate-400">
        Нет доступных рекомендаций по оптимизации бюджета
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {suggestions.map((s, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-start gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0 flex items-center justify-center mt-0.5">
            <AppIcon name="sparkles" size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-white tracking-tight truncate">
                {s.item_name}
              </h4>
              <span className="text-xs font-bold text-emerald-400 shrink-0">
                +{s.potential_savings.toLocaleString()} {currency}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {s.suggestion}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

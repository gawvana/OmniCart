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
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-center text-xs text-zinc-400">
        Нет доступных рекомендаций по оптимизации бюджета
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {suggestions.map((s, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-white/20 dark:border-zinc-700/40 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <AppIcon name="sparkles" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {s.item_name}
              </h4>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                +{s.potential_savings.toLocaleString()} {currency}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {s.suggestion}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface RecurringCardProps {
  id: string;
  name: string;
  intervalDays: number;
  confidence?: number;
  nextDate?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
}

export const RecurringCard: React.FC<RecurringCardProps> = ({
  name,
  intervalDays,
  confidence = 0.8,
  nextDate,
  onAccept,
  onDismiss,
  isLoading = false,
}) => {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <AppIcon name="repeat" size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{name}</h4>
            <p className="text-[11px] text-zinc-400">
              Покупается каждые ~{intervalDays} дн.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {confidencePercent}% точность
        </span>
      </div>

      {nextDate && (
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <AppIcon name="clock" size={13} />
          <span>Ожидается пополнение: {new Date(nextDate).toLocaleDateString()}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {onAccept && (
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <AppIcon name="plus" size={14} />
            <span>В список</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            disabled={isLoading}
            className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-medium transition-colors"
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
};

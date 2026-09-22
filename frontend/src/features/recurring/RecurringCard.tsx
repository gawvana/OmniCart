import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';

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
    <LiquidCard variant="elevated" padding="md" className="space-y-3.5 border-white/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <AppIcon name="recurring" size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-tight">{name}</h4>
            <p className="text-[10px] text-slate-400">
              Покупается каждые ~{intervalDays} дн.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          {confidencePercent}% точность
        </span>
      </div>

      {nextDate && (
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <AppIcon name="clock" size={13} className="text-slate-500" />
          <span>Ожидается пополнение: {new Date(nextDate).toLocaleDateString()}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        {onAccept && (
          <PrimaryButton
            size="sm"
            onClick={onAccept}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            icon={<AppIcon name="plus" size={13} />}
          >
            В список
          </PrimaryButton>
        )}
        {onDismiss && (
          <SecondaryButton
            size="sm"
            onClick={onDismiss}
            disabled={isLoading}
          >
            Пропустить
          </SecondaryButton>
        )}
      </div>
    </LiquidCard>
  );
};

import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';

export interface FamilyCardProps {
  id: string;
  name: string;
  memberCount?: number;
  onInvite?: () => void;
  onSettings?: () => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({
  name,
  memberCount = 1,
  onInvite,
  onSettings,
}) => {
  return (
    <LiquidCard variant="elevated" padding="md" className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
          <AppIcon name="family" size={18} />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white tracking-tight">{name}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{memberCount} участников</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onInvite && (
          <button
            type="button"
            onClick={onInvite}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/30"
          >
            <AppIcon name="plus" size={13} />
            <span>Пригласить</span>
          </button>
        )}
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <AppIcon name="settings" size={15} />
          </button>
        )}
      </div>
    </LiquidCard>
  );
};

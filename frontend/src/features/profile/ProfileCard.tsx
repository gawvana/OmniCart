import React from 'react';
import { LiquidCard } from '@/design-system/components/GlassCard';

export interface ProfileCardProps {
  name: string;
  username?: string;
  telegramId?: number;
  avatarUrl?: string;
  listsCount?: number;
  purchasesCount?: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  telegramId,
  listsCount = 0,
  purchasesCount = 0,
}) => {
  return (
    <LiquidCard variant="elevated" padding="lg" className="space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-lg shadow-emerald-500/10">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white truncate">{name}</h2>
          {username && (
            <p className="text-xs text-emerald-400 font-medium truncate">
              @{username}
            </p>
          )}
          {telegramId && (
            <p className="text-[11px] text-slate-400">ID: {telegramId}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/[0.08]">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
          <span className="text-lg font-bold text-white tracking-tight">{listsCount}</span>
          <p className="text-[11px] text-slate-400">Списков</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
          <span className="text-lg font-bold text-white tracking-tight">{purchasesCount}</span>
          <p className="text-[11px] text-slate-400">Покупок</p>
        </div>
      </div>
    </LiquidCard>
  );
};


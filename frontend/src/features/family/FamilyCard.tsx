import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

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
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <AppIcon name="family" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{name}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{memberCount} участников</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onInvite && (
          <button
            onClick={onInvite}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <AppIcon name="plus" size={14} />
            <span>Пригласить</span>
          </button>
        )}
        {onSettings && (
          <button
            onClick={onSettings}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <AppIcon name="gear" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

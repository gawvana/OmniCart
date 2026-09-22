import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

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
    <div className="p-5 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">{name}</h2>
          {username && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
              @{username}
            </p>
          )}
          {telegramId && (
            <p className="text-[11px] text-zinc-400">ID: {telegramId}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">{listsCount}</span>
          <p className="text-[11px] text-zinc-400">Списков</p>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">{purchasesCount}</span>
          <p className="text-[11px] text-zinc-400">Покупок</p>
        </div>
      </div>
    </div>
  );
};

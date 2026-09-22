import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface FamilyMemberItem {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface MemberListProps {
  members: FamilyMemberItem[];
  onRemove?: (memberId: string) => void;
  canManage?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onRemove,
  canManage = false,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">Владелец</span>;
      case 'admin':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">Админ</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">Участник</span>;
    }
  };

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-2">
      {members.map((m) => (
        <div key={m.id} className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                {m.name}
                {m.isCurrentUser && <span className="text-[10px] text-zinc-400">(Вы)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getRoleBadge(m.role)}
            {canManage && !m.isCurrentUser && m.role !== 'owner' && onRemove && (
              <button
                onClick={() => onRemove(m.id)}
                className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <AppIcon name="trash" size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

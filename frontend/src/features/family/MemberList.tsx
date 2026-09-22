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
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Владелец
          </span>
        );
      case 'admin':
      case 'editor':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
            Редактор
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
            Участник
          </span>
        );
    }
  };

  return (
    <div className="divide-y divide-white/[0.04] rounded-2xl liquid-glass-subtle border border-white/[0.06] p-1.5">
      {members.map((m) => (
        <div key={m.id} className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-xs font-semibold text-white shadow-inner">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-white flex items-center gap-1.5 tracking-tight">
                {m.name}
                {m.isCurrentUser && <span className="text-[10px] text-slate-400">(Вы)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getRoleBadge(m.role)}
            {canManage && !m.isCurrentUser && m.role !== 'owner' && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
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

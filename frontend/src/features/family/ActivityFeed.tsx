import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface ActivityItem {
  id: string;
  eventType: string;
  userName?: string;
  itemName?: string;
  timeAgo?: string;
  created_at?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 liquid-glass-subtle rounded-2xl border border-white/[0.06]">
        Нет недавних действий в семье
      </div>
    );
  }

  const renderDescription = (item: ActivityItem) => {
    switch (item.eventType) {
      case 'item_purchased':
        return (
          <span>
            <strong className="text-white font-semibold">{item.userName || 'Кто-то'}</strong> купил(а){' '}
            <span className="text-emerald-400 font-medium">{item.itemName || 'товар'}</span>
          </span>
        );
      case 'item_added':
        return (
          <span>
            <strong className="text-white font-semibold">{item.userName || 'Кто-то'}</strong> добавил(а){' '}
            <span className="text-slate-200 font-medium">{item.itemName || 'товар'}</span>
          </span>
        );
      case 'member_joined':
        return (
          <span>
            <strong className="text-white font-semibold">{item.userName || 'Новый участник'}</strong> присоединился к семье
          </span>
        );
      default:
        return <span>Обновление в списке покупок</span>;
    }
  };

  return (
    <div className="space-y-1.5">
      {activities.map((act) => (
        <div
          key={act.id}
          className="p-3 rounded-xl liquid-glass-subtle border border-white/[0.05] flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <AppIcon name="clock" size={13} />
            </div>
            <p className="truncate text-slate-300 text-[11px]">
              {renderDescription(act)}
            </p>
          </div>
          {act.timeAgo && (
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{act.timeAgo}</span>
          )}
        </div>
      ))}
    </div>
  );
};

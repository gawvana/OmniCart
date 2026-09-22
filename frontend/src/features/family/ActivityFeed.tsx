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
      <div className="p-6 text-center text-xs text-zinc-400 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
        Нет недавних действий в семье
      </div>
    );
  }

  const renderDescription = (item: ActivityItem) => {
    switch (item.eventType) {
      case 'item_purchased':
        return (
          <span>
            <strong className="text-zinc-900 dark:text-white font-semibold">{item.userName || 'Кто-то'}</strong> купил(а){' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">{item.itemName || 'товар'}</span>
          </span>
        );
      case 'item_added':
        return (
          <span>
            <strong className="text-zinc-900 dark:text-white font-semibold">{item.userName || 'Кто-то'}</strong> добавил(а){' '}
            <span className="text-zinc-700 dark:text-zinc-200 font-medium">{item.itemName || 'товар'}</span>
          </span>
        );
      case 'member_joined':
        return (
          <span>
            <strong className="text-zinc-900 dark:text-white font-semibold">{item.userName || 'Новый участник'}</strong> присоединился к семье
          </span>
        );
      default:
        return <span>Обновление в списке покупок</span>;
    }
  };

  return (
    <div className="space-y-2">
      {activities.map((act) => (
        <div
          key={act.id}
          className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <AppIcon name="clock" size={14} />
            </div>
            <p className="truncate text-zinc-600 dark:text-zinc-300">
              {renderDescription(act)}
            </p>
          </div>
          {act.timeAgo && (
            <span className="text-[11px] text-zinc-400 shrink-0">{act.timeAgo}</span>
          )}
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface InsightCardProps {
  title: string;
  description: string;
  type?: 'positive' | 'warning' | 'neutral';
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type = 'positive',
}) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md ${getBadgeStyle()} flex items-start gap-3`}>
      <div className="p-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 shrink-0">
        <AppIcon name="sparkles" size={18} />
      </div>
      <div>
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-0.5">{title}</h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

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
        return 'liquid-glass-green text-emerald-300 border-emerald-500/25';
      case 'warning':
        return 'liquid-glass-subtle text-amber-300 border-amber-500/25';
      default:
        return 'liquid-glass-subtle text-slate-300 border-white/10';
    }
  };

  return (
    <div className={`p-3.5 rounded-2xl border ${getBadgeStyle()} flex items-start gap-3 select-none`}>
      <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 border border-white/10">
        <AppIcon name="sparkles" size={16} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-white tracking-tight mb-0.5">{title}</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

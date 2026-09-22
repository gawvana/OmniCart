import React from 'react';
import { cn } from '@/utils/cn';
import { AppIcon } from '../icons/AppIcon';

export interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  title,
  subtitle,
  backButton,
  onBack,
  action,
  transparent,
  className,
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 pt-sat px-4 py-3 flex items-center justify-between transition-colors',
        !transparent && 'liquid-glass-subtle border-b border-white/[0.06]',
        className
      )}
    >
      <div className="flex items-center min-w-0 flex-1 gap-2">
        {backButton && (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="w-8 h-8 -ml-1 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
          >
            <AppIcon name="back" size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-400 truncate mt-0.2">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="ml-3 flex-shrink-0 flex items-center gap-2">{action}</div>}
    </header>
  );
};

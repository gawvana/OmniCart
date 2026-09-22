import React from 'react';
import { cn } from '@/utils/cn';
import { GlassButton } from './GlassButton';

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
  title, subtitle, backButton, onBack, action, transparent, className
}) => {
  return (
    <div className={cn(
      "sticky top-0 z-30 pt-sat px-4 pb-2 flex items-center justify-between",
      !transparent && "bg-surface/80 backdrop-blur-xl border-b border-border",
      className
    )}>
      <div className="flex items-center min-w-0 flex-1">
        {backButton && (
          <GlassButton
            variant="ghost"
            size="sm"
            className="mr-2 -ml-2 !w-9 !h-9 p-0 rounded-full"
            onClick={onBack}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </GlassButton>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
          {subtitle && <p className="text-xs text-text-secondary truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

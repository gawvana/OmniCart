import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';
import { tokens } from '../tokens';

export interface SwipeAction {
  content: React.ReactNode;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
}

export interface GlassListRowProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  swipeActions?: SwipeAction[];
  className?: string;
}

export const GlassListRow: React.FC<GlassListRowProps> = ({
  title, subtitle, leading, trailing, onClick, swipeActions, className
}) => {
  const x = useMotionValue(0);
  const actionWidth = 80;
  const maxDrag = swipeActions ? swipeActions.length * actionWidth : 0;

  const dragConstraints = { right: 0, left: -maxDrag };

  return (
    <div className="relative overflow-hidden group">
      {/* Actions Background */}
      {swipeActions && swipeActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end">
          {swipeActions.map((act, i) => (
            <button
              key={i}
              onClick={() => {
                act.onClick();
                x.set(0);
              }}
              style={{ width: actionWidth, backgroundColor: act.color || 'var(--color-destructive)' }}
              className="h-full flex flex-col items-center justify-center text-white text-xs font-medium"
            >
              {act.icon && <span className="mb-1">{act.icon}</span>}
              {act.content}
            </button>
          ))}
        </div>
      )}

      {/* Row Foreground */}
      <motion.div
        style={{ x }}
        drag={swipeActions && swipeActions.length > 0 ? "x" : false}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        transition={tokens.motion.normal}
        onClick={onClick}
        className={cn(
          "relative flex items-center p-4 bg-surface backdrop-blur-md border-b border-border min-h-[44px]",
          onClick && "cursor-pointer active:bg-surface-elevated",
          className
        )}
      >
        {leading && <div className="mr-3 flex-shrink-0">{leading}</div>}
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-text-primary truncate">{title}</div>
          {subtitle && <div className="text-sm text-text-secondary truncate mt-0.5">{subtitle}</div>}
        </div>
        {trailing && <div className="ml-3 flex-shrink-0">{trailing}</div>}
      </motion.div>
    </div>
  );
};

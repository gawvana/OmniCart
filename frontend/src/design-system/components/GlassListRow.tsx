import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
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
  completed?: boolean;
  onClick?: () => void;
  swipeActions?: SwipeAction[];
  className?: string;
}

export const GlassListRow: React.FC<GlassListRowProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  completed = false,
  onClick,
  swipeActions,
  className,
}) => {
  const x = useMotionValue(0);
  const actionWidth = 72;
  const maxDrag = swipeActions ? swipeActions.length * actionWidth : 0;
  const dragConstraints = { right: 0, left: -maxDrag };

  return (
    <div className="relative overflow-hidden rounded-xl my-1 group select-none">
      {/* Swipe Actions Background */}
      {swipeActions && swipeActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end rounded-r-xl overflow-hidden">
          {swipeActions.map((act, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                act.onClick();
                x.set(0);
              }}
              style={{ width: actionWidth, backgroundColor: act.color || 'rgba(239, 68, 68, 0.85)' }}
              className="h-full flex flex-col items-center justify-center text-white text-[11px] font-medium transition-opacity hover:opacity-90 active:scale-95"
            >
              {act.icon && <span className="mb-0.5">{act.icon}</span>}
              {act.content}
            </button>
          ))}
        </div>
      )}

      {/* Row Foreground */}
      <motion.div
        style={{ x }}
        drag={swipeActions && swipeActions.length > 0 ? 'x' : false}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        transition={tokens.motion.normal}
        onClick={onClick}
        className={cn(
          'relative flex items-center px-3.5 py-3 liquid-glass-subtle border border-white/[0.06] rounded-xl transition-all duration-200',
          onClick && 'cursor-pointer hover:border-white/15 hover:bg-white/[0.04] active:scale-[0.995]',
          completed && 'opacity-55',
          className
        )}
      >
        {leading && <div className="mr-3 flex-shrink-0 flex items-center">{leading}</div>}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'text-sm font-medium tracking-tight truncate transition-all',
              completed ? 'line-through text-slate-400' : 'text-slate-100'
            )}
          >
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-slate-400 tracking-tight truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {trailing && <div className="ml-3 flex-shrink-0 flex items-center gap-1.5">{trailing}</div>}
      </motion.div>
    </div>
  );
};

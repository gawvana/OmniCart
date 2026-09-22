import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface TabItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number | string;
}

export interface GlassTabBarProps {
  items: TabItem[];
  activeIndex: number;
  onTabClick: (index: number, path: string) => void;
  className?: string;
}

export const GlassTabBar: React.FC<GlassTabBarProps> = ({ items, activeIndex, onTabClick, className }) => {
  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 pb-sab pt-1.5 px-3 liquid-glass-floating border-t border-white/[0.08] z-40',
        className
      )}
    >
      <div className="flex items-center justify-around h-13 max-w-md mx-auto">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => onTabClick(index, item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors focus:outline-none select-none group"
            >
              <div
                className={cn(
                  'mb-0.5 relative z-10 transition-transform duration-200',
                  isActive ? 'text-emerald-400 scale-105' : 'text-slate-400 group-hover:text-slate-200'
                )}
              >
                {item.icon}
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] leading-none px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors tracking-tight',
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                )}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute -top-1.5 w-8 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

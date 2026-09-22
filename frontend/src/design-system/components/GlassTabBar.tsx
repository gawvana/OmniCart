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
    <div className={cn(
      "fixed bottom-0 inset-x-0 pb-sab pt-2 px-2 bg-surface/80 backdrop-blur-xl border-t border-border z-40",
      className
    )}>
      <div className="flex items-center justify-around h-14">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => onTabClick(index, item.path)}
              className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors focus:outline-none"
            >
              <div className={cn(
                "mb-1 relative z-10 transition-colors",
                isActive ? "text-accent" : "text-text-tertiary"
              )}>
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-text-primary" : "text-text-tertiary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 w-12 h-1 bg-accent rounded-full opacity-20 blur-sm"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

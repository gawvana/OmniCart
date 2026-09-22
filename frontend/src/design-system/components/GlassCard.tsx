import React from 'react';
import { cn } from '@/utils/cn';

export interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'default' | 'elevated' | 'floating' | 'green';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const LiquidCard = React.forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
    const variants = {
      subtle: 'liquid-glass-subtle text-slate-200',
      default: 'liquid-glass text-slate-100',
      elevated: 'liquid-glass-elevated text-slate-50',
      floating: 'liquid-glass-floating text-white shadow-2xl',
      green: 'liquid-glass-green text-emerald-100',
    };

    const paddings = {
      none: '',
      xs: 'p-2.5',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl relative transition-all duration-200',
          variants[variant],
          paddings[padding],
          interactive && 'hover:scale-[1.01] active:scale-[0.99] cursor-pointer hover:border-white/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LiquidCard.displayName = 'LiquidCard';

// Backward-compatible alias
export const GlassCard = LiquidCard;
export type GlassCardProps = LiquidCardProps;

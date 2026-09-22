import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { tokens } from '../tokens';

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, fullWidth, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-xl backdrop-blur-md relative overflow-hidden';
    
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm border border-transparent',
      secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-elevated',
      ghost: 'bg-transparent text-text-primary hover:bg-black/5 dark:hover:bg-white/10',
      destructive: 'bg-destructive/10 text-destructive border border-transparent hover:bg-destructive/20',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm min-w-[2.25rem]',
      md: 'h-11 px-4 text-base min-w-[2.75rem]',
      lg: 'h-14 px-6 text-lg min-w-[3.5rem]',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={tokens.motion.micro}
        className={cn(
          baseStyle,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : icon ? (
          <span className={cn(children && "mr-2")}>{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);
GlassButton.displayName = 'GlassButton';

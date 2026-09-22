import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { tokens } from '../tokens';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, fullWidth, ...props }, ref) => {
    const baseStyle =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none rounded-xl relative overflow-hidden select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 hover:brightness-105 active:brightness-95',
      secondary:
        'liquid-glass text-slate-100 border border-white/10 hover:border-white/20 hover:bg-white/[0.08] active:bg-white/[0.04]',
      glass:
        'liquid-glass-subtle text-slate-200 border border-white/05 hover:border-white/15 hover:bg-white/[0.06]',
      ghost:
        'bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent',
      danger:
        'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25',
      destructive:
        'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs rounded-lg min-w-[1.75rem]',
      sm: 'h-9 px-3 text-xs sm:text-sm rounded-xl min-w-[2.25rem]',
      md: 'h-11 px-4 text-sm font-medium rounded-xl min-w-[2.75rem]',
      lg: 'h-13 px-6 text-base font-semibold rounded-2xl min-w-[3.25rem]',
      icon: 'h-10 w-10 p-0 rounded-xl flex items-center justify-center',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={tokens.motion.micro}
        className={cn(baseStyle, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : icon ? (
          <span className={cn(children && 'mr-2')}>{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);
GlassButton.displayName = 'GlassButton';

export const PrimaryButton: React.FC<GlassButtonProps> = (props) => <GlassButton variant="primary" {...props} />;
export const SecondaryButton: React.FC<GlassButtonProps> = (props) => <GlassButton variant="secondary" {...props} />;
export const DangerButton: React.FC<GlassButtonProps> = (props) => <GlassButton variant="danger" {...props} />;
export const GhostButton: React.FC<GlassButtonProps> = (props) => <GlassButton variant="ghost" {...props} />;
export const GlassIconButton: React.FC<GlassButtonProps> = (props) => <GlassButton size="icon" variant="secondary" {...props} />;

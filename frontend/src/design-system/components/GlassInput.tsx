import React from 'react';
import { cn } from '@/utils/cn';

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  multiline?: boolean;
}

export const GlassInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassInputProps>(
  ({ className, label, error, icon, rightAction, multiline, ...props }, ref) => {
    const inputClasses = cn(
      'w-full liquid-glass-subtle border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all duration-200',
      error ? 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500' : 'border-white/10 hover:border-white/20',
      icon && 'pl-10',
      rightAction && 'pr-10',
      multiline ? 'min-h-[90px] resize-y' : 'h-11',
      className
    );

    const InputComponent = multiline ? 'textarea' : 'input';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-medium text-slate-300 pl-1">{label}</label>}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <InputComponent ref={ref as any} className={inputClasses} {...(props as any)} />
          {rightAction && <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">{rightAction}</div>}
        </div>
        {error && <span className="text-xs text-rose-400 pl-1">{error}</span>}
      </div>
    );
  }
);
GlassInput.displayName = 'GlassInput';

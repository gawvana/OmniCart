import React from 'react';
import { cn } from '@/utils/cn';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
}

export const GlassInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassInputProps>(
  ({ className, label, error, icon, multiline, ...props }, ref) => {
    const inputClasses = cn(
      'w-full bg-surface border backdrop-blur-md rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all',
      error ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' : 'border-border',
      icon && 'pl-11',
      multiline ? 'min-h-[100px] resize-y' : 'h-12',
      className
    );

    const InputComponent = multiline ? 'textarea' : 'input';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-text-secondary pl-1">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <InputComponent
            ref={ref as any}
            className={inputClasses}
            {...(props as any)}
          />
        </div>
        {error && <span className="text-xs text-destructive pl-1">{error}</span>}
      </div>
    );
  }
);
GlassInput.displayName = 'GlassInput';

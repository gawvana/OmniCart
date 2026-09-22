import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface LiquidCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const LiquidCheckbox: React.FC<LiquidCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  ariaLabel = 'Checkbox',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 rounded-md',
    md: 'w-6 h-6 rounded-lg',
    lg: 'w-7 h-7 rounded-xl',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex items-center justify-center transition-all duration-200 focus:outline-none select-none flex-shrink-0',
        sizeClasses[size],
        checked
          ? 'bg-emerald-500 border border-emerald-400/60 shadow-md shadow-emerald-950/40 text-white'
          : 'liquid-glass-subtle border border-white/15 hover:border-white/30 text-transparent',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && 'cursor-pointer active:scale-90',
        className
      )}
    >
      <motion.svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      >
        <motion.polyline
          points="20 6 9 17 4 12"
          initial={false}
          animate={
            checked
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      </motion.svg>
    </button>
  );
};

import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export interface GlassSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
}) => {
  const variants = {
    text: 'rounded-md h-3.5 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-24 w-full',
  };

  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.75, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, height }}
      className={cn(
        'liquid-glass-subtle border border-white/[0.04] overflow-hidden relative',
        variants[variant],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-pulse" />
    </motion.div>
  );
};

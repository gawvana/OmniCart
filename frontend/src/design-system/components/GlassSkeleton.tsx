import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export interface GlassSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className
}) => {
  const variants = {
    text: 'rounded-md h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, height }}
      className={cn(
        "bg-border-strong overflow-hidden relative",
        variants[variant],
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
    </motion.div>
  );
};

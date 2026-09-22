import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { tokens } from '../tokens';
import { cn } from '@/utils/cn';
import { AppIcon } from '../icons/AppIcon';

export interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  className?: string;
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const dragControls = useDragControls();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={tokens.motion.springy}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 liquid-glass-floating border-t border-white/12 rounded-t-[28px] pb-sab flex flex-col max-h-[88dvh] max-w-lg mx-auto shadow-2xl overflow-hidden',
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex-shrink-0 pt-3 pb-2 flex justify-center w-full cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {title && (
              <div className="px-6 pb-3 pt-1 flex items-center justify-between border-b border-white/[0.06]">
                <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                  <AppIcon name="close" size={16} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const LiquidSheet = GlassSheet;

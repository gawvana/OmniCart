import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { cn } from '@/utils/cn';
import { AppIcon } from '../icons/AppIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

let toastCount = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCount}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const iconMap: Record<ToastType, { icon: React.ReactNode; color: string }> = {
    success: {
      icon: <AppIcon name="check" size={16} />,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    },
    error: {
      icon: <AppIcon name="close" size={16} />,
      color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    },
    warning: {
      icon: <AppIcon name="warning" size={16} />,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
    info: {
      icon: <AppIcon name="info" size={16} />,
      color: 'text-slate-300 bg-white/10 border-white/15',
    },
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center p-3 pt-sat gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const item = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
              onClick={() => removeToast(toast.id)}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl liquid-glass-floating border border-white/15 shadow-xl min-w-[220px] max-w-sm cursor-pointer select-none transition-transform active:scale-95'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center border flex-shrink-0',
                  item.color
                )}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium text-white flex-1 leading-snug">
                {toast.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

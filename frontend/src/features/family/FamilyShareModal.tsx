import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { useTelegram } from '@/hooks/useTelegram';

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const { user, openTelegramLink, hapticFeedback } = useTelegram();
  const [copied, setCopied] = useState(false);

  const effectiveId = userId || user?.id || 'demo';
  const shareLink = `https://t.me/OmniCartV2_bot?start=cart_${effectiveId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    hapticFeedback.notificationOccurred('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(
      'Давай вести список покупок вместе! Открой ссылку в боте OmniCart AI:\n' + shareLink
    );
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`;
    if (openTelegramLink) {
      openTelegramLink(tgUrl);
    } else {
      window.open(tgUrl, '_blank');
    }
    hapticFeedback.impactOccurred('medium');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-md border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl liquid-glass text-white"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-3 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-inner">
                <AppIcon name="family" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Семейный список</h2>
                <p className="text-[11px] text-slate-400">Совместные покупки в реальном времени</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <AppIcon name="close" size={16} />
            </button>
          </div>

          {/* Description */}
          <div className="py-4 space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Отправьте эту ссылку близким. Как только они откроют её в Telegram, ваш список покупок станет общим: добавления и вычёркивания товаров будут видны всем сразу!
            </p>

            {/* Link box */}
            <div className="p-3 rounded-2xl liquid-glass-subtle border border-white/10 flex items-center justify-between gap-2 shadow-inner">
              <span className="text-xs font-mono text-emerald-400 truncate select-all">
                {shareLink}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white flex items-center gap-1.5 transition-all border border-white/10"
              >
                {copied ? (
                  <AppIcon name="check" size={14} className="text-emerald-400" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
                <span>{copied ? 'Скопировано' : 'Копия'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleTelegramShare}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-[0.98] transition-all"
            >
              <AppIcon name="share" size={15} />
              <span>Поделиться в Telegram</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

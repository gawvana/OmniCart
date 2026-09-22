import React, { useState } from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  inviteLink,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Приглашение в семью OmniCart',
        text: 'Присоединяйся к нашему списку покупок в OmniCart!',
        url: inviteLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <AppIcon name="share" size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base">
              Пригласить в семью
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <AppIcon name="close" size={18} />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Отправьте эту ссылку близким. Перейдя по ней, они смогут просматривать и редактировать общие списки покупок.
        </p>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate">
            {inviteLink}
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors shrink-0 flex items-center gap-1"
          >
            <AppIcon name={copied ? 'check' : 'edit'} size={13} />
            <span>{copied ? 'Скопировано' : 'Копия'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleShare}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <AppIcon name="share" size={15} />
            <span>Поделиться</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-xs transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidModal } from '@/design-system/components/GlassModal';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Приглашение в семью OmniCart',
          text: 'Присоединяйся к нашему списку покупок в OmniCart!',
          url: inviteLink,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <LiquidModal isOpen={isOpen} onClose={onClose} title="Пригласить в семью" size="sm">
      <div className="space-y-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          Отправьте ссылку близким. Они смогут совместно добавлять и отмечать товары в реальном времени.
        </p>

        <div className="p-2.5 rounded-xl liquid-glass-subtle border border-white/10 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300 font-mono truncate">
            {inviteLink}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-medium hover:bg-white/20 active:scale-95 transition-all shrink-0 flex items-center gap-1 border border-white/10"
          >
            <AppIcon name={copied ? 'check' : 'edit'} size={12} className={copied ? 'text-emerald-400' : ''} />
            <span>{copied ? 'Скопировано' : 'Копия'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <PrimaryButton onClick={handleShare} icon={<AppIcon name="share" size={15} />}>
            Поделиться
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>
            Закрыть
          </SecondaryButton>
        </div>
      </div>
    </LiquidModal>
  );
};

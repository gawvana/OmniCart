import React, { useState } from 'react';
import { ShoppingItem as IShoppingItem } from '../../types';
import { ShoppingItem } from './ShoppingItem';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const CompletedSection: React.FC<{
  items: IShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ items, onToggle, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <div className="mt-8 pt-4 border-t border-white/[0.08]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 text-left group select-none py-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors tracking-tight">
            {t('completedItems', 'Куплено')}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {items.length}
          </span>
        </div>
        <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
          <AppIcon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
        </div>
      </button>
      {isOpen && (
        <div className="space-y-1.5 opacity-80">
          {items.map((item) => (
            <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

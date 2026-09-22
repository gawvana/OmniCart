import React, { useState } from 'react';
import { ShoppingItem as IShoppingItem } from '../../types';
import { ShoppingItem } from './ShoppingItem';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const CategorySection: React.FC<{
  category: string;
  items: IShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ category, items, onToggle, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 text-left group select-none py-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors tracking-tight">
            {category}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-400">
            {items.length}
          </span>
        </div>
        <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
          <AppIcon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
        </div>
      </button>
      {isOpen && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ShoppingItem as IShoppingItem } from '../../types';
import { ShoppingItem } from './ShoppingItem';
import { useTranslation } from 'react-i18next';

export const CompletedSection = ({ items, onToggle, onDelete }: { items: IShoppingItem[], onToggle: (id: string) => void, onDelete: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <div className="mt-8 pt-4 border-t border-white/20">
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-semibold text-gray-500 flex items-center gap-2">
          {t('completedItems', 'Completed')} <span className="bg-white/30 text-xs px-2 py-1 rounded-full">{items.length}</span>
        </h3>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div className="space-y-2 opacity-70">
          {items.map(item => (
            <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

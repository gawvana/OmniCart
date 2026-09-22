import React, { useState } from 'react';
import { ShoppingItem as IShoppingItem } from '../../types';
import { ShoppingItem } from './ShoppingItem';

export const CategorySection = ({ category, items, onToggle, onDelete }: { category: string, items: IShoppingItem[], onToggle: (id: string) => void, onDelete: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {category} <span className="bg-white/50 text-xs px-2 py-1 rounded-full">{items.length}</span>
        </h3>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div className="space-y-2">
          {items.map(item => (
            <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ShoppingItem as IShoppingItem } from '../../types';
import { useTranslation } from 'react-i18next';

export const ShoppingItem = ({ item, onToggle, onDelete }: { item: IShoppingItem, onToggle: (id: string) => void, onDelete: (id: string) => void }) => {
  const controls = useAnimation();
  const { t } = useTranslation();

  return (
    <motion.div 
      drag="x" 
      dragConstraints={{ left: -100, right: 0 }}
      onDragEnd={(e, info) => { if (info.offset.x < -50) onDelete(item.id); }}
      className={`p-4 mb-2 rounded-xl backdrop-blur-md bg-white/30 border border-white/20 flex items-center justify-between shadow-sm min-h-[44px] ${item.isPurchased ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          checked={item.isPurchased} 
          onChange={() => onToggle(item.id)}
          className="w-6 h-6 rounded-full border-2 border-primary/50 text-primary focus:ring-primary/50 bg-white/50"
        />
        <div>
          <h4 className={`text-lg font-medium text-gray-800 ${item.isPurchased ? 'line-through' : ''}`}>
            {item.name} {item.category && <span>{item.category}</span>}
          </h4>
          <p className="text-sm text-gray-600">{item.quantity} {item.unit} {item.price ? `• $${item.price}` : ''}</p>
        </div>
      </div>
    </motion.div>
  );
};

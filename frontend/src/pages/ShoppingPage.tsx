import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShoppingItems, useAddItem, usePurchaseItem, useDeleteItem } from '../hooks/useShoppingList';
import { AddItemInput } from '../features/shopping/AddItemInput';
import { CategorySection } from '../features/shopping/CategorySection';
import { CompletedSection } from '../features/shopping/CompletedSection';
import { ShoppingItem as IShoppingItem } from '../types';

export const ShoppingPage = ({ listId = 'default' }: { listId?: string }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useShoppingItems(listId);
  const addItem = useAddItem(listId);
  const toggleItem = usePurchaseItem(listId);
  const deleteItem = useDeleteItem(listId);

  const activeItems = items.filter((i: IShoppingItem) => !i.isPurchased);
  const completedItems = items.filter((i: IShoppingItem) => i.isPurchased);

  const categories = Array.from(new Set(activeItems.map((i: any) => i.category || 'Other'))) as string[];

  const handleAdd = (text: string) => {
    if (text.trim()) {
      addItem.mutate({ name: text, quantity: 1, unit: 'pcs' });
    }
  };

  const handleToggle = (id: string) => {
    toggleItem.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('shoppingList', 'Shopping List')}</h1>
      
      <div className="mb-6 sticky top-4 z-10">
        <AddItemInput onAdd={handleAdd} onAiParse={(text) => console.log('AI Parse:', text)} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white/40 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-white/40 rounded-xl animate-pulse"></div>
        </div>
      ) : activeItems.length === 0 && completedItems.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-gray-500 mb-4">{t('emptyList', 'Your list is empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <CategorySection 
              key={cat} 
              category={cat} 
              items={activeItems.filter((i: IShoppingItem) => (i.category || 'Other') === cat)} 
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          
          <CompletedSection items={completedItems} onToggle={handleToggle} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
};

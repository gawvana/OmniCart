import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShoppingItems, useAddItem, usePurchaseItem, useDeleteItem } from '../hooks/useShoppingList';
import { AddItemInput } from '../features/shopping/AddItemInput';
import { CategorySection } from '../features/shopping/CategorySection';
import { CompletedSection } from '../features/shopping/CompletedSection';
import { ShoppingItem as IShoppingItem } from '../types';
import { aiApi } from '../api/ai';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';

export const ShoppingPage = ({ listId = 'default' }: { listId?: string }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useShoppingItems(listId);
  const addItem = useAddItem(listId);
  const toggleItem = usePurchaseItem(listId);
  const deleteItem = useDeleteItem(listId);

  const [isAiParsing, setIsAiParsing] = useState(false);
  const [storeMode, setStoreMode] = useState(false);

  const activeItems = items.filter((i: IShoppingItem) => !i.isPurchased);
  const completedItems = items.filter((i: IShoppingItem) => i.isPurchased);

  const categories = Array.from(
    new Set(activeItems.map((i: any) => i.category || 'Другое'))
  ) as string[];

  const handleAdd = (text: string) => {
    if (text.trim()) {
      addItem.mutate({ name: text.trim(), quantity: 1, unit: 'шт' });
    }
  };

  const handleAiParse = async (text: string) => {
    if (!text.trim()) return;
    try {
      setIsAiParsing(true);
      const res = await aiApi.parseItems(text);
      if (res && res.items && Array.isArray(res.items)) {
        for (const it of res.items) {
          addItem.mutate({
            name: it.name,
            quantity: it.quantity || 1,
            unit: it.unit || 'шт',
            category: it.category || 'Другое',
          });
        }
      } else {
        handleAdd(text);
      }
    } catch (err) {
      console.error('AI parse error', err);
      handleAdd(text);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleToggle = (id: string) => {
    toggleItem.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('shoppingList', 'Список покупок')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {activeItems.length} активных товаров
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStoreMode(!storeMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all select-none ${
            storeMode
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
              : 'liquid-glass-subtle border border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <AppIcon name="store" size={14} />
          <span>{storeMode ? 'В магазине' : 'Режим покупок'}</span>
        </button>
      </div>

      {/* Input */}
      {!storeMode && (
        <div className="mb-4 sticky top-2 z-10">
          <AddItemInput
            onAdd={handleAdd}
            onAiParse={handleAiParse}
            isLoading={isAiParsing}
          />
        </div>
      )}

      {/* AI Parsing status */}
      {isAiParsing && (
        <div className="p-3 mb-4 rounded-xl liquid-glass-green text-emerald-400 text-xs flex items-center gap-2 animate-pulse">
          <AppIcon name="sparkles" size={16} />
          <span>{t('ai.processing', 'AI обрабатывает ваш список...')}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-2.5">
          <GlassSkeleton variant="card" />
          <GlassSkeleton variant="card" />
          <GlassSkeleton variant="card" />
        </div>
      ) : activeItems.length === 0 && completedItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl liquid-glass-subtle border border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-3 border border-emerald-500/20 shadow-inner">
            <AppIcon name="cart" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">
            {t('shopping.emptyTitle', 'Список пока пуст')}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {t('shopping.emptyDesc', 'Введите товар выше или нажмите иконку AI для добавления целого рецепта')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={activeItems.filter(
                (i: IShoppingItem) => (i.category || 'Другое') === cat
              )}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}

          <CompletedSection
            items={completedItems}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useShoppingItems, useAddItem, usePurchaseItem, useDeleteItem, useUpdateItem } from '../hooks/useShoppingList';
import { AddItemInput, AddItemData } from '../features/shopping/AddItemInput';
import { CategorySection } from '../features/shopping/CategorySection';
import { CompletedSection } from '../features/shopping/CompletedSection';
import { TotalBar } from '../features/shopping/TotalBar';
import { FamilyShareModal } from '../features/family/FamilyShareModal';
import { ShoppingItem as IShoppingItem } from '../types';
import { aiApi } from '../api/ai';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';
import { cn } from '@/utils/cn';

export const ShoppingPage = ({ listId = 'default' }: { listId?: string }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useShoppingItems(listId);
  const addItem = useAddItem(listId);
  const toggleItem = usePurchaseItem(listId);
  const deleteItem = useDeleteItem(listId);
  const updateItem = useUpdateItem(listId);

  const [isAiParsing, setIsAiParsing] = useState(false);
  const [storeMode, setStoreMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Undo state
  const [undoItem, setUndoItem] = useState<IShoppingItem | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeItems = items.filter((i: IShoppingItem) => !i.isPurchased);
  const completedItems = items.filter((i: IShoppingItem) => i.isPurchased);

  const categories = Array.from(
    new Set(activeItems.map((i: any) => i.category || 'Другое'))
  ) as string[];

  const handleAdd = (data: AddItemData) => {
    if (data.name.trim()) {
      addItem.mutate({
        name: data.name.trim(),
        quantity: data.quantity || 1,
        unit: data.unit || 'шт',
        price: data.price,
        category: data.category || 'Другое',
      });
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
            price: it.price,
            category: it.category || 'Другое',
          });
        }
      } else {
        handleAdd({ name: text.trim() });
      }
    } catch (err) {
      console.error('AI parse error', err);
      handleAdd({ name: text.trim() });
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleToggle = (id: string) => {
    toggleItem.mutate(id);
  };

  const handleDelete = (id: string) => {
    const target = items.find((i: any) => i.id === id);
    if (target) {
      setUndoItem(target);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setUndoItem(null);
      }, 5000);
    }
    deleteItem.mutate(id);
  };

  const handleUndo = () => {
    if (undoItem) {
      addItem.mutate({
        name: undoItem.name,
        quantity: undoItem.quantity || 1,
        unit: undoItem.unit || 'шт',
        price: undoItem.price,
        category: undoItem.category || 'Другое',
      });
      setUndoItem(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    updateItem.mutate({ itemId: id, data: { quantity: newQty } });
  };

  const handleClearCompleted = () => {
    completedItems.forEach((it: any) => {
      deleteItem.mutate(it.id);
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t('shoppingList', 'Список покупок')}
            </h1>
            {/* Online / Offline status badge */}
            <div
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 border select-none',
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                )}
              />
              <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {activeItems.length} активных товаров
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-xl liquid-glass-subtle border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all select-none"
            title="Семейный доступ"
          >
            <AppIcon name="family" size={15} />
          </button>

          <button
            type="button"
            onClick={() => setStoreMode(!storeMode)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all select-none',
              storeMode
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                : 'liquid-glass-subtle border border-white/10 text-slate-300 hover:border-white/20'
            )}
          >
            <AppIcon name="store" size={14} />
            <span>{storeMode ? 'В магазине' : 'Режим покупок'}</span>
          </button>
        </div>
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
            {t('shopping.emptyDesc', 'Введите товар выше или выберите быстрое добавление')}
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
              onUpdateQty={handleUpdateQty}
            />
          ))}

          <CompletedSection
            items={completedItems}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onClear={handleClearCompleted}
          />
        </div>
      )}

      {/* Floating Undo Toast */}
      <AnimatePresence>
        {undoItem && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[136px] left-4 right-4 max-w-md mx-auto z-30 pointer-events-none"
          >
            <div className="pointer-events-auto p-3 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl flex items-center justify-between text-xs text-white">
              <span className="truncate mr-2 text-slate-200">
                Удалено: <span className="font-semibold text-white">«{undoItem.name}»</span>
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 active:scale-95 transition-all shrink-0 shadow-md shadow-emerald-950/40"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Total Bar */}
      <TotalBar items={items} />

      {/* Family Share Modal */}
      <FamilyShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

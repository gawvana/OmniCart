import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { historyApi } from '../api/history';
import { itemsApi } from '../api/items';
import { HistoryGroup } from '../features/history/HistoryGroup';
import { HistoryItemData } from '../features/history/HistoryItem';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const HistoryPage = () => {
  const { t } = useTranslation();
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await historyApi.get({ limit: 50 });
      if (res && Array.isArray(res.items)) {
        setHistoryItems(res.items);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReAdd = async (item: HistoryItemData) => {
    try {
      setToastMsg(`"${item.name}" добавлен в список`);
      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const totalSpent = historyItems.reduce((sum, it) => sum + (it.price || 0), 0);

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('history', 'История покупок')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {historyItems.length} совершенных покупок
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <AppIcon name="clock" size={20} />
        </div>
      </header>

      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
          <AppIcon name="check" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Total Spending Stat */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-400">Всего по истории</span>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {totalSpent.toLocaleString()} UZS
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <AppIcon name="repeat" size={16} />
        </button>
      </div>

      {/* History Items list */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
            <AppIcon name="clock" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">История пуста</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Купленные товары будут автоматически сохраняться здесь
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <HistoryGroup
            title="Все покупки"
            totalSpent={totalSpent}
            currency="UZS"
            items={historyItems}
            onReAdd={handleReAdd}
          />
        </div>
      )}
    </div>
  );
};

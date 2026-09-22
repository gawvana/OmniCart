import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { historyApi } from '../api/history';
import { HistoryGroup } from '../features/history/HistoryGroup';
import { HistoryItemData } from '../features/history/HistoryItem';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';
import { useToastStore } from '@/design-system/components/GlassToast';

export const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToastStore();

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
      addToast({
        message: `"${item.name}" добавлен в корзину`,
        type: 'success',
      });
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
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('history', 'История покупок')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {historyItems.length} совершенных покупок
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
          <AppIcon name="history" size={16} />
        </div>
      </header>

      {/* Total Spending Stat */}
      <LiquidCard variant="subtle" padding="sm" className="flex items-center justify-between border-white/[0.06]">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Всего по истории
          </span>
          <p className="text-lg font-bold text-white tracking-tight mt-0.5">
            {totalSpent.toLocaleString()} <span className="text-xs font-normal text-slate-400">UZS</span>
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <AppIcon name="sync" size={15} />
        </button>
      </LiquidCard>

      {/* History Items list */}
      {isLoading ? (
        <div className="space-y-2">
          <GlassSkeleton variant="card" height={80} />
          <GlassSkeleton variant="card" height={80} />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl liquid-glass-subtle border border-white/[0.06] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] text-slate-400 mx-auto flex items-center justify-center">
            <AppIcon name="history" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-white">История пуста</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Купленные товары будут автоматически сохраняться здесь
          </p>
        </div>
      ) : (
        <HistoryGroup
          title="Завершенные покупки"
          totalSpent={totalSpent}
          currency="UZS"
          items={historyItems}
          onReAdd={handleReAdd}
        />
      )}
    </div>
  );
};

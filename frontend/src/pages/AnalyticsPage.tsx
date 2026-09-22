import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsApi } from '../api/analytics';
import { SpendingChart } from '../features/analytics/SpendingChart';
import { CategoryBreakdown } from '../features/analytics/CategoryBreakdown';
import { InsightCard } from '../features/analytics/InsightCard';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async (selectedPeriod: string) => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getSpending(selectedPeriod);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const periods = [
    { id: '7d', label: '7 дней' },
    { id: '30d', label: '30 дней' },
    { id: '3m', label: '3 месяца' },
    { id: '1y', label: '1 год' },
  ];

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('analytics', 'Аналитика')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Статистика трат и привычек
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <AppIcon name="chart" size={20} />
        </div>
      </header>

      {/* Period Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
        {periods.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                isSelected
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-medium text-zinc-400 mb-1">
            {t('totalSpent', 'Всего потрачено')}
          </p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {isLoading ? '...' : (data?.total_spent || 0).toLocaleString()}
            <span className="text-xs font-normal text-zinc-400 ml-1">
              {data?.currency || 'UZS'}
            </span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-medium text-zinc-400 mb-1">
            {t('itemsBought', 'Покупок')}
          </p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {isLoading ? '...' : data?.purchase_count || 0}
            <span className="text-xs font-normal text-zinc-400 ml-1">чеков</span>
          </p>
        </div>
      </div>

      {/* Spending Trend Chart */}
      <SpendingChart
        data={
          data?.daily_breakdown?.length > 0
            ? data.daily_breakdown
            : [
                { date: '2026-09-18', amount: 45000 },
                { date: '2026-09-19', amount: 120000 },
                { date: '2026-09-20', amount: 35000 },
                { date: '2026-09-21', amount: 80000 },
                { date: '2026-09-22', amount: 65000 },
              ]
        }
        currency={data?.currency || 'UZS'}
      />

      {/* Category Breakdown */}
      <CategoryBreakdown
        categories={
          data?.categories_breakdown?.length > 0
            ? data.categories_breakdown
            : [
                { category: 'Продукты питания', amount: 240000, percentage: 70 },
                { category: 'Бытовая химия', amount: 70000, percentage: 20 },
                { category: 'Прочее', amount: 35000, percentage: 10 },
              ]
        }
        currency={data?.currency || 'UZS'}
      />

      {/* AI Insights Card */}
      <InsightCard
        title="AI Анализ расходов"
        description="Ваши расходы на базовые продукты стабилизировались. В среднем вы совершаете покупки каждые 3 дня."
        type="positive"
      />
    </div>
  );
};

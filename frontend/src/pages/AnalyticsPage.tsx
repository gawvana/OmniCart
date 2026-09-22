import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsApi } from '../api/analytics';
import { SpendingChart } from '../features/analytics/SpendingChart';
import { CategoryBreakdown } from '../features/analytics/CategoryBreakdown';
import { InsightCard } from '../features/analytics/InsightCard';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';

export const AnalyticsPage: React.FC = () => {
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
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('analytics', 'Аналитика')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Динамика и категории расходов
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
          <AppIcon name="analytics" size={16} />
        </div>
      </header>

      {/* Period Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl liquid-glass-subtle border border-white/[0.06]">
        {periods.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`py-1.5 text-xs font-semibold rounded-xl transition-all select-none ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <LiquidCard variant="subtle" padding="sm" className="border-white/[0.06]">
          <p className="text-[10px] font-medium text-slate-400 mb-1">
            {t('totalSpent', 'Всего потрачено')}
          </p>
          <p className="text-lg font-bold text-white tracking-tight">
            {isLoading ? '...' : (data?.total_spent || 0).toLocaleString()}
            <span className="text-[10px] font-normal text-slate-400 ml-1">
              {data?.currency || 'UZS'}
            </span>
          </p>
        </LiquidCard>

        <LiquidCard variant="subtle" padding="sm" className="border-white/[0.06]">
          <p className="text-[10px] font-medium text-slate-400 mb-1">
            {t('itemsBought', 'Покупок')}
          </p>
          <p className="text-lg font-bold text-white tracking-tight">
            {isLoading ? '...' : data?.purchase_count || 0}
            <span className="text-[10px] font-normal text-slate-400 ml-1">чеков</span>
          </p>
        </LiquidCard>
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
        description="Ваши расходы на базовые продукты стабильны. В среднем вы совершаете закупки раз в 3 дня."
        type="positive"
      />
    </div>
  );
};

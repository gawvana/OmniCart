import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLists } from '../hooks/useLists';
import { listsApi } from '../api/lists';
import { aiApi } from '../api/ai';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';
import { LiquidModal } from '@/design-system/components/GlassModal';
import { GlassInput } from '@/design-system/components/GlassInput';
import { AIPlanResult, PlanCategory } from '../features/ai/AIPlanResult';

export const HomePage: React.FC<{ onSelectList?: (listId: string) => void }> = ({ onSelectList }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: lists = [], isLoading, refetch } = useLists();

  // Create List Modal state
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // AI Plan Modal state
  const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
  const [planDays, setPlanDays] = useState(7);
  const [planPeople, setPlanPeople] = useState(2);
  const [planBudget, setPlanBudget] = useState('350000');
  const [planPreferences, setPlanPreferences] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    name: string;
    totalCost?: number;
    categories: PlanCategory[];
  } | null>(null);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      setIsCreatingList(true);
      await listsApi.createList({ name: newListName.trim(), emoji: '🛒', color: '#10B981' });
      setNewListName('');
      setIsAddListOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      const res = await aiApi.createPlan({
        days: planDays,
        people: planPeople,
        budget: Number(planBudget) || undefined,
        preferences: planPreferences || undefined,
      });

      if (res) {
        setGeneratedPlan({
          name: res.plan_name || `План на ${planDays} дн.`,
          totalCost: res.total_estimated_cost,
          categories: res.categories || [],
        });
      }
    } catch (err) {
      console.error('Plan generation failed', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAddAllPlanItems = async () => {
    if (!generatedPlan) return;
    try {
      // Create new list for the plan
      const newList = await listsApi.createList({
        name: generatedPlan.name,
        emoji: '🥗',
        color: '#10B981',
      });
      setIsAiPlanOpen(false);
      setGeneratedPlan(null);
      refetch();
      if (onSelectList) {
        onSelectList(newList.id);
      } else {
        navigate({ to: '/shopping' });
      }
    } catch (err) {
      console.error('Failed to add plan items', err);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Top Header */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-sm">
            <AppIcon name="cart" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">OmniCart AI</h1>
            <p className="text-[11px] text-slate-400">Умные списки и умный бюджет</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: '/profile' })}
          className="w-8 h-8 rounded-xl liquid-glass-subtle border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <AppIcon name="profile" size={16} />
        </button>
      </header>

      {/* Main Hero Action */}
      <LiquidCard variant="elevated" padding="md" className="relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Быстрое действие
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Список покупок
            </h2>
            <p className="text-xs text-slate-400 max-w-[210px]">
              Добавляйте голосом, текстом или рецептом
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: '/shopping' })}
            className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <AppIcon name="plus" size={20} />
          </button>
        </div>
      </LiquidCard>

      {/* Quick Actions 4-Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setIsAddListOpen(true)}
          className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-center gap-3 transition-all active:scale-[0.98] text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-200 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
            <AppIcon name="plus" size={17} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-tight">Новый список</div>
            <div className="text-[10px] text-slate-400">Создать корзину</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsAiPlanOpen(true)}
          className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-center gap-3 transition-all active:scale-[0.98] text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-colors">
            <AppIcon name="sparkles" size={17} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-tight">AI Меню</div>
            <div className="text-[10px] text-slate-400">План на неделю</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: '/budget' })}
          className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-center gap-3 transition-all active:scale-[0.98] text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-200 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
            <AppIcon name="budget" size={17} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-tight">Бюджет</div>
            <div className="text-[10px] text-slate-400">Лимиты и траты</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: '/history' })}
          className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-center gap-3 transition-all active:scale-[0.98] text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-slate-200 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
            <AppIcon name="history" size={17} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-tight">История</div>
            <div className="text-[10px] text-slate-400">Прошлые чеки</div>
          </div>
        </button>
      </div>

      {/* Your Lists Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('yourLists', 'Ваши списки')}
          </h2>
          <button
            type="button"
            onClick={() => navigate({ to: '/lists' })}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Все ({lists.length})
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-14 rounded-2xl liquid-glass-subtle animate-pulse" />
            <div className="h-14 rounded-2xl liquid-glass-subtle animate-pulse" />
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl liquid-glass-subtle border border-white/[0.06]">
            <p className="text-xs text-slate-400 mb-3">{t('noLists', 'Списков пока нет')}</p>
            <PrimaryButton size="sm" onClick={() => setIsAddListOpen(true)}>
              Создать первый список
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-2">
            {lists.slice(0, 4).map((list: any) => (
              <div
                key={list.id}
                onClick={() => {
                  if (onSelectList) onSelectList(list.id);
                  else navigate({ to: '/shopping' });
                }}
                className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/[0.06] hover:border-white/15 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <AppIcon name="lists" size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-white tracking-tight">
                      {list.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {list.is_default ? 'Основной список' : 'Семейный доступ'}
                    </p>
                  </div>
                </div>
                <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  <AppIcon name="chevron-right" size={15} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Smart Insights */}
      <LiquidCard variant="subtle" padding="sm" className="border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <AppIcon name="sparkles" size={14} />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white tracking-tight">Умный совет недели</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Покупка молочных продуктов в начале недели позволяет снизить спонтанные траты на 12%.
            </p>
          </div>
        </div>
      </LiquidCard>

      {/* Modal: Create List */}
      <LiquidModal
        isOpen={isAddListOpen}
        onClose={() => setIsAddListOpen(false)}
        title="Новый список"
        size="sm"
      >
        <form onSubmit={handleCreateList} className="space-y-4">
          <GlassInput
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Название (например, Продукты на неделю)"
            autoFocus
          />
          <div className="flex gap-2">
            <SecondaryButton fullWidth onClick={() => setIsAddListOpen(false)}>
              Отмена
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isCreatingList || !newListName.trim()}
              loading={isCreatingList}
              fullWidth
            >
              Создать
            </PrimaryButton>
          </div>
        </form>
      </LiquidModal>

      {/* Modal: AI Plan */}
      <LiquidModal
        isOpen={isAiPlanOpen}
        onClose={() => {
          setIsAiPlanOpen(false);
          setGeneratedPlan(null);
        }}
        title="AI План питания"
        size="md"
      >
        {!generatedPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Дней</label>
                <GlassInput
                  type="number"
                  min={1}
                  max={30}
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Персон</label>
                <GlassInput
                  type="number"
                  min={1}
                  max={10}
                  value={planPeople}
                  onChange={(e) => setPlanPeople(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">Бюджет (UZS)</label>
              <GlassInput
                type="text"
                value={planBudget}
                onChange={(e) => setPlanBudget(e.target.value)}
                placeholder="350000"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium pl-1 mb-1 block">
                Предпочтения / Диета
              </label>
              <GlassInput
                value={planPreferences}
                onChange={(e) => setPlanPreferences(e.target.value)}
                placeholder="Без сахара, больше овощей, курица"
              />
            </div>

            <PrimaryButton
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              loading={isGeneratingPlan}
              fullWidth
              icon={<AppIcon name="sparkles" size={16} />}
            >
              {isGeneratingPlan ? 'Генерация плана...' : 'Сгенерировать меню'}
            </PrimaryButton>
          </div>
        ) : (
          <AIPlanResult
            planName={generatedPlan.name}
            totalEstimatedCost={generatedPlan.totalCost}
            categories={generatedPlan.categories}
            onAddAll={handleAddAllPlanItems}
          />
        )}
      </LiquidModal>
    </div>
  );
};

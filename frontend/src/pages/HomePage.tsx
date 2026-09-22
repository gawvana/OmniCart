import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLists } from '../hooks/useLists';
import { listsApi } from '../api/lists';
import { aiApi } from '../api/ai';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { AIPlanResult, PlanCategory } from '../features/ai/AIPlanResult';

export const HomePage = ({ onSelectList }: { onSelectList?: (listId: string) => void }) => {
  const { t } = useTranslation();
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
      await listsApi.createList({ name: newListName.trim(), emoji: '🛒', color: '#3B82F6' });
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

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('greeting', 'Главная')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('homeSubtitle', 'Умный шопинг и списки покупок')}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          <AppIcon name="cart" size={20} />
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsAddListOpen(true)}
          className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <AppIcon name="plus" size={20} />
          </div>
          <span className="font-semibold text-xs text-zinc-900 dark:text-white">
            {t('addList', 'Создать список')}
          </span>
        </button>

        <button
          onClick={() => setIsAiPlanOpen(true)}
          className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <AppIcon name="sparkles" size={20} />
          </div>
          <span className="font-semibold text-xs text-zinc-900 dark:text-white">
            {t('aiPlan', 'AI План меню')}
          </span>
        </button>
      </div>

      {/* Your Lists */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {t('yourLists', 'Ваши списки')}
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            {lists.length} списков
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
            <div className="h-16 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3">{t('noLists', 'Списков пока нет')}</p>
            <button
              onClick={() => setIsAddListOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Создать первый список
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lists.map((list: any) => (
              <div
                key={list.id}
                onClick={() => onSelectList?.(list.id)}
                className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{list.emoji || '🛒'}</span>
                  <div>
                    <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                      {list.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {list.is_default ? 'Основной список' : 'Общий список'}
                    </p>
                  </div>
                </div>
                <div className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  <AppIcon name="chevron-right" size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Create List */}
      {isAddListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Новый список</h3>
              <button onClick={() => setIsAddListOpen(false)} className="text-zinc-400 p-1">
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Название (например, Продукты на неделю)"
                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none text-sm text-zinc-900 dark:text-white"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={isCreatingList}
                  className="py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors"
                >
                  {isCreatingList ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddListOpen(false)}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Plan */}
      {isAiPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AppIcon name="sparkles" size={20} className="text-purple-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">AI План покупок</h3>
              </div>
              <button onClick={() => { setIsAiPlanOpen(false); setGeneratedPlan(null); }} className="text-zinc-400 p-1">
                <AppIcon name="close" size={18} />
              </button>
            </div>

            {!generatedPlan ? (
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Количество дней
                  </label>
                  <input
                    type="number"
                    value={planDays}
                    onChange={(e) => setPlanDays(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Количество человек
                  </label>
                  <input
                    type="number"
                    value={planPeople}
                    onChange={(e) => setPlanPeople(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Бюджет (UZS)
                  </label>
                  <input
                    type="text"
                    value={planBudget}
                    onChange={(e) => setPlanBudget(e.target.value)}
                    placeholder="Например: 500000"
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Пожелания / предпочтения
                  </label>
                  <textarea
                    value={planPreferences}
                    onChange={(e) => setPlanPreferences(e.target.value)}
                    placeholder="Без свинины, больше овощей, халяль..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {isGeneratingPlan ? 'Генерация плана...' : 'Сгенерировать план'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AIPlanResult
                  planName={generatedPlan.name}
                  totalEstimatedCost={generatedPlan.totalCost}
                  currency="UZS"
                  categories={generatedPlan.categories}
                  onAddAll={async () => {
                    // add to first list or create new
                    if (lists.length > 0) {
                      const targetList = lists[0].id;
                      for (const cat of generatedPlan.categories) {
                        for (const it of cat.items) {
                          await listsApi.createList({ name: it.name }).catch(() => {});
                        }
                      }
                    }
                    setIsAiPlanOpen(false);
                    setGeneratedPlan(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

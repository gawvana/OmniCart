import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLists } from '../hooks/useLists';

export const HomePage = () => {
  const { t } = useTranslation();
  const { data: lists, isLoading } = useLists();

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('greeting', 'Hello, User')}</h1>
          <p className="text-gray-500">{t('homeSubtitle', 'Ready to shop?')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">U</div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white flex flex-col items-center justify-center gap-2 shadow-sm min-h-[100px]">
          <span className="text-2xl">➕</span>
          <span className="font-medium text-sm">{t('addList', 'Add List')}</span>
        </button>
        <button className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white flex flex-col items-center justify-center gap-2 shadow-sm min-h-[100px]">
          <span className="text-2xl">🧠</span>
          <span className="font-medium text-sm">{t('aiPlan', 'AI Plan')}</span>
        </button>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">{t('yourLists', 'Your Lists')}</h2>
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-24 bg-white/40 rounded-2xl"></div>
            </div>
          </div>
        ) : lists?.length === 0 ? (
          <div className="text-center p-8 bg-white/40 backdrop-blur rounded-2xl">
            <p className="text-gray-500">{t('noLists', 'No lists yet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists?.map(list => (
              <div key={list.id} className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{list.name}</h3>
                  <p className="text-sm text-gray-500">{list.itemsCount} {t('items', 'items')}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">→</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

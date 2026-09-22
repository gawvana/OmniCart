import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLists } from '../hooks/useLists';

export const ListsPage = () => {
  const { t } = useTranslation();
  const { data: lists, isLoading } = useLists();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('myLists', 'My Lists')}</h1>
        <button className="bg-primary text-white p-2 rounded-xl w-10 h-10 flex items-center justify-center">+</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {lists?.map((list: any) => (
            <div key={list.id} className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-sm aspect-square flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                📝
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 truncate">{list.name}</h3>
                <p className="text-xs text-gray-500">{list.itemsCount} {t('items', 'items')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

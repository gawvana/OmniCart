import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchApi } from '../api/search';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const SearchPage = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    items?: any[];
    history?: any[];
    products?: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await searchApi.query(query.trim());
        if (res) {
          setResults(res);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t('search', 'Поиск')}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Поиск по спискам, истории и каталогу
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <AppIcon name="search" size={18} />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти товар, покупку, категорию..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white outline-none shadow-sm focus:border-blue-500 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
          >
            <AppIcon name="close" size={16} />
          </button>
        )}
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="space-y-3">
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
          <div className="h-14 bg-white/40 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <AppIcon name="search" size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Быстрый глобальный поиск
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Начните вводить название товара (например, "молоко", "яйца")
          </p>
        </div>
      ) : results && (!results.items?.length && !results.history?.length && !results.products?.length) ? (
        <div className="text-center py-12 text-xs text-zinc-400">
          Ничего не найдено по запросу "{query}"
        </div>
      ) : results ? (
        <div className="space-y-4">
          {/* Shopping items */}
          {results.items && results.items.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                В списках ({results.items.length})
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1">
                {results.items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AppIcon name="cart" size={14} className="text-blue-600" />
                      <span className="font-semibold text-zinc-900 dark:text-white">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {item.is_purchased ? 'Куплено' : 'В корзине'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {results.history && results.history.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                В истории покупок ({results.history.length})
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1">
                {results.history.map((hist) => (
                  <div key={hist.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-900 dark:text-white">{hist.name}</span>
                    {hist.price && (
                      <span className="text-zinc-500 font-semibold">{hist.price.toLocaleString()} UZS</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog */}
          {results.products && results.products.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                В каталоге ({results.products.length})
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1">
                {results.products.map((prod) => (
                  <div key={prod.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-900 dark:text-white">{prod.name}</span>
                    <span className="text-[10px] text-zinc-400">{prod.default_unit || 'шт'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

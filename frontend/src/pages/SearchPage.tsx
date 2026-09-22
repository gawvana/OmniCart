import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchApi } from '../api/search';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { GlassInput } from '@/design-system/components/GlassInput';
import { LiquidCard } from '@/design-system/components/GlassCard';

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
    <div className="p-4 space-y-4 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t('search', 'Поиск')}
        </h1>
        <p className="text-xs text-slate-400">
          Поиск по спискам, истории и каталогу
        </p>
      </header>

      {/* Search Input */}
      <div>
        <GlassInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти товар, покупку, категорию..."
          icon={<AppIcon name="search" size={16} />}
          rightAction={
            query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-white p-1"
              >
                <AppIcon name="close" size={14} />
              </button>
            ) : null
          }
          autoFocus
        />
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="space-y-3">
          <div className="h-14 bg-white/[0.04] rounded-2xl animate-pulse" />
          <div className="h-14 bg-white/[0.04] rounded-2xl animate-pulse" />
        </div>
      ) : !query.trim() ? (
        <LiquidCard variant="subtle" padding="lg" className="text-center py-14 space-y-2 border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <AppIcon name="search" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Быстрый глобальный поиск
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Начните вводить название товара (например, "молоко", "яйца")
          </p>
        </LiquidCard>
      ) : results && (!results.items?.length && !results.history?.length && !results.products?.length) ? (
        <LiquidCard variant="subtle" padding="md" className="text-center py-10 text-xs text-slate-400">
          Ничего не найдено по запросу "{query}"
        </LiquidCard>
      ) : results ? (
        <div className="space-y-4">
          {/* Shopping items */}
          {results.items && results.items.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                В списках ({results.items.length})
              </h3>
              <LiquidCard variant="subtle" padding="none" className="divide-y divide-white/[0.06] overflow-hidden">
                {results.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                        <AppIcon name="cart" size={13} />
                      </div>
                      <span className="font-medium text-white">{item.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                      {item.is_purchased ? 'Куплено' : 'В корзине'}
                    </span>
                  </div>
                ))}
              </LiquidCard>
            </div>
          )}

          {/* History */}
          {results.history && results.history.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                В истории покупок ({results.history.length})
              </h3>
              <LiquidCard variant="subtle" padding="none" className="divide-y divide-white/[0.06] overflow-hidden">
                {results.history.map((hist) => (
                  <div key={hist.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors">
                    <span className="font-medium text-white">{hist.name}</span>
                    {hist.price && (
                      <span className="text-emerald-400 font-medium">{hist.price.toLocaleString()} UZS</span>
                    )}
                  </div>
                ))}
              </LiquidCard>
            </div>
          )}

          {/* Catalog */}
          {results.products && results.products.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                В каталоге ({results.products.length})
              </h3>
              <LiquidCard variant="subtle" padding="none" className="divide-y divide-white/[0.06] overflow-hidden">
                {results.products.map((prod) => (
                  <div key={prod.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors">
                    <span className="font-medium text-white">{prod.name}</span>
                    <span className="text-[10px] text-slate-400">{prod.default_unit || 'шт'}</span>
                  </div>
                ))}
              </LiquidCard>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

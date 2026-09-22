import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { cn } from '@/utils/cn';

export const AddItemInput: React.FC<{
  onAdd: (text: string) => void;
  onAiParse: (text: string) => void;
  isLoading?: boolean;
}> = ({ onAdd, onAiParse, isLoading = false }) => {
  const [text, setText] = useState('');
  const { t } = useTranslation();

  const handleAddClick = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  };

  return (
    <div className="p-1.5 liquid-glass-subtle border border-white/[0.08] rounded-2xl flex items-center gap-1.5 shadow-lg shadow-black/20 focus-within:border-emerald-500/40 transition-colors">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('addItemPlaceholder', 'Добавить товар или продиктовать...')}
        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm px-3 min-h-[44px]"
      />
      <button
        type="button"
        onClick={() => {
          if (text.trim()) {
            onAiParse(text.trim());
            setText('');
          }
        }}
        disabled={isLoading}
        title={t('ai.parseTitle', 'Распознать с помощью AI')}
        className={cn(
          'p-2.5 rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center',
          isLoading && 'animate-pulse'
        )}
      >
        <AppIcon name="sparkles" size={17} />
      </button>
      <button
        type="button"
        onClick={handleAddClick}
        disabled={isLoading || !text.trim()}
        title={t('common.add', 'Добавить')}
        className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shadow-md shadow-emerald-950/40"
      >
        <AppIcon name="plus" size={17} />
      </button>
    </div>
  );
};

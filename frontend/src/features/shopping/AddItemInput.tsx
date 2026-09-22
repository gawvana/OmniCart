import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const AddItemInput = ({
  onAdd,
  onAiParse,
  isLoading = false,
}: {
  onAdd: (text: string) => void;
  onAiParse: (text: string) => void;
  isLoading?: boolean;
}) => {
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
    <div className="p-2.5 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/30 dark:border-zinc-800 rounded-2xl flex items-center gap-2 shadow-sm">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('addItemPlaceholder', 'Добавить товар или список...')}
        className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-sm px-2 min-h-[44px]"
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onAiParse(text.trim());
            setText('');
          }
        }}
        disabled={isLoading}
        title="Распознать с помощью AI"
        className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <AppIcon name="sparkles" size={18} />
      </button>
      <button
        onClick={handleAddClick}
        disabled={isLoading}
        title="Добавить"
        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
      >
        <AppIcon name="plus" size={18} />
      </button>
    </div>
  );
};

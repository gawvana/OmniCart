import React from 'react';
import { AppIcon } from '@/design-system/icons/AppIcon';

export interface ThemeToggleProps {
  currentTheme: 'light' | 'dark' | 'auto';
  onChange: (theme: 'light' | 'dark' | 'auto') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  currentTheme,
  onChange,
}) => {
  const options: Array<{ id: 'light' | 'dark' | 'auto'; label: string; icon: 'sun' | 'moon' | 'gear' }> = [
    { id: 'light', label: 'Светлая', icon: 'sun' },
    { id: 'dark', label: 'Тёмная', icon: 'moon' },
    { id: 'auto', label: 'Системная', icon: 'gear' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const isSelected = currentTheme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              isSelected
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                : 'bg-white/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800'
            }`}
          >
            <AppIcon name={opt.icon} size={18} />
            <span className="text-xs">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

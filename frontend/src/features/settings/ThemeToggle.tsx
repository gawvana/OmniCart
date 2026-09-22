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
                ? 'liquid-glass-elevated border-emerald-500/50 text-emerald-400 font-semibold shadow-sm shadow-emerald-500/10'
                : 'liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/20'
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

import React from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export interface LanguagePickerProps {
  currentLanguage: string;
  onChange: (code: string) => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  currentLanguage,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LANGUAGES.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`p-3 rounded-2xl border text-center transition-all ${
              isSelected
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                : 'bg-white/50 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800'
            }`}
          >
            <div className="text-xl mb-1">{lang.flag}</div>
            <div className="text-xs">{lang.name}</div>
          </button>
        );
      })}
    </div>
  );
};

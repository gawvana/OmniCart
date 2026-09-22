import React from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  short: string;
}

export interface LanguagePickerProps {
  currentLanguage: string;
  onChange: (code: string) => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ru', name: 'Русский', short: 'RU' },
  { code: 'uz', name: "O'zbekcha", short: 'UZ' },
  { code: 'en', name: 'English', short: 'EN' },
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
                ? 'liquid-glass-elevated border-emerald-500/50 text-emerald-400 font-semibold shadow-sm shadow-emerald-500/10'
                : 'liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="text-base font-bold tracking-wider mb-0.5">{lang.short}</div>
            <div className="text-[11px] opacity-80">{lang.name}</div>
          </button>
        );
      })}
    </div>
  );
};

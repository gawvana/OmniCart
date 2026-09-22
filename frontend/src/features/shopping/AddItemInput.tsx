import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const AddItemInput = ({ onAdd, onAiParse }: { onAdd: (text: string) => void, onAiParse: (text: string) => void }) => {
  const [text, setText] = useState('');
  const { t } = useTranslation();

  return (
    <div className="p-3 backdrop-blur-lg bg-white/40 border border-white/30 rounded-2xl flex items-center gap-2 shadow-sm">
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('addItemPlaceholder', 'Add item...')} 
        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 min-h-[44px]"
      />
      <button onClick={() => onAiParse(text)} className="p-2 rounded-xl bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 transition min-h-[44px] min-w-[44px]">🧠</button>
      <button onClick={() => { onAdd(text); setText(''); }} className="p-2 rounded-xl bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition min-h-[44px] min-w-[44px]">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

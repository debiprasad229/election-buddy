import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../store/useElectionStore';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const LanguageFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const { language, setLanguage } = useElectionStore();

  const handleLanguageChange = (code) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                aria-pressed={language === lang.code}
                className={`flex items-center justify-between gap-4 px-4 py-2 rounded-xl text-sm transition-colors ${language === lang.code
                    ? 'bg-governance-100 dark:bg-governance-900/50 text-governance-800 dark:text-governance-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <span>{lang.native}</span>
                <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                  {lang.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-governance-600 hover:bg-governance-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-governance-600/30 transition-transform hover:scale-105 active:scale-95"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Languages className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default LanguageFab;

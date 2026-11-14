import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalizedString } from '../types/category';
import { TRANSLATIONS, TranslationsDictionary } from './translations';

export type Language = 'es' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (localized?: LocalizedString | string) => string;
  dict: TranslationsDictionary;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('visual_tda_lang');
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('visual_tda_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (localized?: LocalizedString | string): string => {
    if (!localized) return '';
    if (typeof localized === 'string') return localized;
    return localized[language] || localized.es || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dict: TRANSLATIONS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import React, { createContext, useState, FC, ReactNode, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

type Translations = typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedTranslation = (language: Language, key: string): string | undefined => {
    const langTranslations = translations[language] as any;
    return key.split('.').reduce((obj, k) => obj && obj[k], langTranslations);
};

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
      const savedLang = localStorage.getItem('app-language') as Language;
      return savedLang || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
      localStorage.setItem('app-language', lang);
      setLanguage(lang);
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(language, key);

    if (!translation) {
      // Fallback to English if translation is missing
      translation = getNestedTranslation('en', key);
    }

    if (!translation) {
      return key; // Return the key if no translation is found
    }
    
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return translation;
  }, [language]);


  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

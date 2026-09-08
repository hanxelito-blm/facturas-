import { createContext, useContext, useState, useMemo } from 'react';
import { translations, LANGUAGES } from './translations';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');

  const t = useMemo(() => {
    const base = translations[lang] || translations.es;
    return (key) => base[key] || key;
  }, [lang]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <TranslationContext.Provider value={{ t, lang, changeLanguage, LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

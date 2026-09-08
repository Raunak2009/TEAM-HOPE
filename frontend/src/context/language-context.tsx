import { createContext, useContext, useState, type ReactNode } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('hope-language') === 'kannada' ? 'kn' : 'en'
  );

  const setLanguage = (lang: string) => {
    localStorage.setItem('hope-language', lang === 'kn' ? 'kannada' : 'english');
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { translations, type Locale } from './translations';

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18n>({
  locale: 'fr',
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage?.getItem('locale');
    return saved === 'en' ? 'en' : 'fr';
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage?.setItem('locale', l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string): string =>
    translations[locale][key] ?? translations.en[key] ?? key;

  return (
    <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
  );
}

export function useI18n(): I18n {
  return useContext(Ctx);
}

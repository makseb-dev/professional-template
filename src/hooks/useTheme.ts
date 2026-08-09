import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches === true
  );
}

function initialTheme(): Theme {
  const stored = localStorage?.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

export function useTheme(): {
  theme: Theme;
  toggle: () => void;
} {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage?.setItem('theme', theme);
  }, [theme]);

  const toggle = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}

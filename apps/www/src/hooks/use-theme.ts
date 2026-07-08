import { useEffect, useState } from "react";
import {
  applyTheme,
  getInitialTheme,
  getSystemTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "../lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next = getSystemTheme();
      setThemeState(next);
      applyTheme(next);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return {
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => (current === "light" ? "dark" : "light")),
  };
}

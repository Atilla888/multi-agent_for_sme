"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { themeAttribute, type ThemeChoice } from "@/i18n/theme";

const ThemeContext = createContext<{ readonly theme: ThemeChoice; readonly setTheme: (theme: ThemeChoice) => void }>({
  theme: "system",
  setTheme: () => {},
});

/** Holds the saved theme choice (read from the cookie by the root layout) so the switch shows it on first render. */
export function ThemeProvider({ initialTheme, children }: { readonly initialTheme: ThemeChoice; readonly children: ReactNode }) {
  const [theme, setThemeState] = useState(initialTheme);
  function setTheme(next: ThemeChoice) {
    setThemeState(next);
    const value = themeAttribute(next);
    if (value) document.documentElement.dataset.theme = value;
    else delete document.documentElement.dataset.theme;
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

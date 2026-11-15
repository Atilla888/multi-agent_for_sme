/** "system" follows the operating system; "light" and "dark" pin the theme with data-theme on <html>. */
export const themes = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof themes)[number];

export const themeCookie = "theme";

export function resolveTheme(saved: string | undefined): ThemeChoice {
  return (themes as readonly string[]).includes(saved ?? "") ? (saved as ThemeChoice) : "system";
}

/** Value for <html data-theme>; undefined lets the stylesheet follow the operating system. */
export function themeAttribute(theme: ThemeChoice): "light" | "dark" | undefined {
  return theme === "system" ? undefined : theme;
}

import type { ColorTheme } from "./types";

const PREFIX = "h_kg:";

export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // 忽略配额超限
  }
}

export function readColorTheme(): ColorTheme {
  return readStoredJson<ColorTheme>("color-theme", "light");
}

export function writeColorTheme(theme: ColorTheme): void {
  writeStoredJson("color-theme", theme);
}

"use client"

import { useEffect, useSyncExternalStore } from "react"

export type Theme = "light" | "dark"

const THEME_STORAGE_KEY = "portfolio-theme"

const themeListeners = new Set<() => void>()

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback)
  return () => themeListeners.delete(callback)
}

function getThemeSnapshot(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"
}

function getThemeServerSnapshot(): Theme {
  return "light"
}

function setTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyThemeClass(theme)
  themeListeners.forEach((listener) => listener())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot)

  // Keep the <html> class in sync, including on first mount where the
  // inline script in layout.tsx may have already set it from localStorage.
  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return { theme, setTheme, toggleTheme }
}

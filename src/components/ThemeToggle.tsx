"use client"

import { useTheme } from "@/hooks/use-theme"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={toggleTheme}
      className={`relative h-5 w-10 shrink-0 rounded-full border normal-case tracking-normal transition-colors ${
        isDark ? "border-white/70 " : "border-black/70 "
      }`}
    >
      <span
        className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-200 ${
          isDark ? "left-[3px] bg-white" : "left-[21px] bg-black"
        }`}
      />
    </button>
  )
}

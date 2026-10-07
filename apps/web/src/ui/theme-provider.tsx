import {  createContext, useContext, useEffect, useState } from "react"
import type {ReactNode} from "react";

export type Theme = "dark" | "light" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "astrion-theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server and first client render agree ("system", light); the blocking
  // script in <head> has already set the real class on <html>. Stored and
  // system preferences are read after mount to avoid hydration mismatches.
  const [theme, setThemeState] = useState<Theme>("system")
  const [systemDark, setSystemDark] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "dark" || stored === "light") setThemeState(stored)
    } catch {
      /* storage unavailable: follow the system */
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemDark(mql.matches)
    const onChange = () => setSystemDark(mql.matches)
    mql.addEventListener("change", onChange)
    setReady(true)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme: "dark" | "light" = theme === "system" ? (systemDark ? "dark" : "light") : theme

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* not persisted */
    }
    setThemeState(next)
  }

  useEffect(() => {
    if (!ready) return
    const root = document.documentElement
    if (root.classList.contains(resolvedTheme)) return
    root.classList.remove("dark", "light")
    root.classList.add(resolvedTheme)
  }, [ready, resolvedTheme])

  return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

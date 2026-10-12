"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "dark" | "light"

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: "dark", toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    // Read saved theme or current DOM class applied by inline script
    const stored = localStorage.getItem("bokra-theme") as Theme
    if (stored === "dark" || stored === "light") {
      setTheme(stored)
      document.documentElement.classList.toggle("dark", stored === "dark")
    } else {
      const isDark = document.documentElement.classList.contains("dark")
      const current = isDark ? "dark" : "light"
      setTheme(current)
      localStorage.setItem("bokra-theme", current)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("bokra-theme", next)
    document.cookie = `bokra-theme=${next}; path=/; max-age=31536000`
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 bg-white/5 dark:bg-[#fff8dc]/[0.03]
                 hover:bg-black/5 dark:hover:bg-[#fff8dc]/[0.06]
                 border border-black/[0.08] dark:border-[#fff8dc]/[0.06]
                 text-[#6b5e4e] dark:text-[#8a8278]
                 hover:text-[#c9a84c] dark:hover:text-[#c9a84c]
                 transition-all duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      {mounted && theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : mounted && theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <span className="w-4 h-4" />
      )}
    </button>
  )
}

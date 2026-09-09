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
    const stored = localStorage.getItem("bokra-theme") as Theme
    const initial = stored || "dark"
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("bokra-theme", next)
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
  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 bg-white/5 dark:bg-white/5
                 hover:bg-black/5 dark:hover:bg-white/10
                 border border-black/[0.08] dark:border-white/[0.08]
                 text-[#6b5e4e] dark:text-[#9b9080]
                 hover:text-[#c9a84c] dark:hover:text-[#c9a84c]
                 transition-all duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  )
}

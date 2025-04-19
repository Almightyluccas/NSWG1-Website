"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useTheme } from "next-themes"

export interface ThemeOption {
  name: string
  accent: string
  accentDarker: string
}

export interface ThemeContextType {
  themes: ThemeOption[]
  currentAccent: ThemeOption
  setCurrentAccent: (theme: ThemeOption) => void
  addCustomTheme: (theme: ThemeOption) => void
}

const defaultThemes: ThemeOption[] = [
  { name: "Gold", accent: "223, 192, 105", accentDarker: "201, 168, 75" }, // Default gold/amber
  { name: "Blue", accent: "59, 130, 246", accentDarker: "37, 99, 235" }, // Blue
  { name: "Green", accent: "34, 197, 94", accentDarker: "22, 163, 74" }, // Green
  { name: "Red", accent: "239, 68, 68", accentDarker: "220, 38, 38" }, // Red
  { name: "Purple", accent: "168, 85, 247", accentDarker: "147, 51, 234" }, // Purple
]

export const ThemeContext = createContext<ThemeContextType>({
  themes: defaultThemes,
  currentAccent: defaultThemes[0],
  setCurrentAccent: () => {},
  addCustomTheme: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<ThemeOption[]>(defaultThemes)
  const [currentAccent, setCurrentAccent] = useState<ThemeOption>(defaultThemes[0])
  const { theme } = useTheme()

  // Load saved accent from localStorage on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem("accent-theme")
    if (savedAccent) {
      try {
        const parsedAccent = JSON.parse(savedAccent)
        setCurrentAccent(parsedAccent)
        applyAccentToDOM(parsedAccent)
      } catch (e) {
        console.error("Failed to parse saved accent theme", e)
      }
    }
  }, [])

  // Apply accent colors to DOM
  const applyAccentToDOM = (theme: ThemeOption) => {
    document.documentElement.style.setProperty("--accent-color", theme.accent)
    document.documentElement.style.setProperty("--accent-color-darker", theme.accentDarker)
  }

  const handleSetCurrentAccent = (theme: ThemeOption) => {
    setCurrentAccent(theme)
    applyAccentToDOM(theme)
    localStorage.setItem("accent-theme", JSON.stringify(theme))
  }

  const addCustomTheme = (theme: ThemeOption) => {
    setThemes((prev) => [...prev, theme])
  }

  return (
      <ThemeContext.Provider
          value={{
            themes,
            currentAccent,
            setCurrentAccent: handleSetCurrentAccent,
            addCustomTheme,
          }}
      >
        {children}
      </ThemeContext.Provider>
  )
}

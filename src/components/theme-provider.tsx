"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import Cookies from 'js-cookie'

export interface ThemeOption {
  name: string
  accent: string
  accentDarker: string
}


interface ThemeContextType {
  themes: ThemeOption[]
  currentAccent: ThemeOption
  setCurrentAccent: (theme: ThemeOption) => void
  addCustomTheme: (theme: ThemeOption) => void
  mode: string | undefined
  setMode: (mode: string) => void
  toggleMode: () => void
}

const defaultThemes: ThemeOption[] = [
  { name: "Gold", accent: "223, 192, 105", accentDarker: "201, 168, 75" },
  { name: "Blue", accent: "59, 130, 246", accentDarker: "37, 99, 235" },
  { name: "Green", accent: "34, 197, 94", accentDarker: "22, 163, 74" },
  { name: "Red", accent: "239, 68, 68", accentDarker: "220, 38, 38" },
  { name: "Purple", accent: "168, 85, 247", accentDarker: "147, 51, 234" },
]

const ThemeContext = createContext<ThemeContextType>({
  themes: defaultThemes,
  currentAccent: defaultThemes[3],
  setCurrentAccent: () => {},
  addCustomTheme: () => {},
  mode: undefined,
  setMode: () => {},
  toggleMode: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<ThemeOption[]>(defaultThemes)
  const [mounted, setMounted] = useState(false)
  const [currentAccent, setCurrentAccent] = useState<ThemeOption>(defaultThemes[3])
  const [mode, setMode] = useState<string | undefined>(undefined)

  useEffect(() => {
    setMounted(true)

    const savedAccent = Cookies.get('accent-theme')
    if (savedAccent) {
      try {
        const parsedAccent = JSON.parse(savedAccent)
        setCurrentAccent(parsedAccent)
        applyAccentToDOM(parsedAccent)
      } catch (e) {
        console.error("Failed to parse saved accent theme", e)
      }
    } else {
      applyAccentToDOM(defaultThemes[3])
    }

    const savedMode = Cookies.get('theme')
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  const applyAccentToDOM = (theme: ThemeOption) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty("--accent-color", theme.accent)
      document.documentElement.style.setProperty("--accent-color-darker", theme.accentDarker)
    }
  }

  const handleSetCurrentAccent = (theme: ThemeOption) => {
    setCurrentAccent(theme)
    if (mounted) {
      applyAccentToDOM(theme)
      Cookies.set('accent-theme', JSON.stringify(theme), { expires: 365 })
    }
  }

  const addCustomTheme = (theme: ThemeOption) => {
    setThemes(prev => [...prev, theme])
  }

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    Cookies.set('theme', newMode, { expires: 365 })
  }

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }} suppressHydrationWarning />
  }

  return (
    <ThemeContext.Provider
      value={{
        themes,
        currentAccent,
        setCurrentAccent: handleSetCurrentAccent,
        addCustomTheme,
        mode,
        setMode,
        toggleMode
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme={mode}
        enableSystem={true}
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}
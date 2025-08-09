"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useSession } from "next-auth/react"
import { CustomTheme } from "@/types/database"
import { defaultThemes } from "@/lib/defaultThemes"

interface ThemeContextType {
  themes: CustomTheme[]
  currentAccent: CustomTheme
  setCurrentAccent: (theme: CustomTheme) => void
  addCustomTheme: (theme: CustomTheme) => void
  mode: string | undefined
  setMode: (mode: string) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  themes: defaultThemes,
  currentAccent: defaultThemes[3],
  setCurrentAccent: () => {},
  addCustomTheme: () => {},
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: React.ReactNode,
  initialTheme: CustomTheme
}) {
  const { data: session, status, update: updateSession } = useSession()

  const isDefault = defaultThemes.some(t => t.name === initialTheme.name);

  const [currentAccent, setCurrentAccent] = useState<CustomTheme>(initialTheme)
  const [themes, setThemes] = useState<CustomTheme[]>([
    ...defaultThemes,
    ...(!isDefault ? [initialTheme] : [])
  ])
  const [mode, setMode] = useState<string | undefined>('dark')

  useEffect(() => {

    if (status === 'authenticated' && session?.user) {
      const allThemes = [...defaultThemes, ...(session.user.customThemes || [])]
      setThemes(allThemes)
      // setMode(session.user.preferences?.mode || 'dark')
    }
  }, [status, session])

  const applyAccentToDOM = (theme: CustomTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty("--accent-color", theme.accent)
      document.documentElement.style.setProperty("--accent-color-darker", theme.accentDarker)
    }
  }

  const handleSetCurrentAccent = async (theme: CustomTheme) => {
    setCurrentAccent(theme)
    applyAccentToDOM(theme)
    await updateSession({ preferences: { activeThemeName: theme.name } })
  }

  const addCustomTheme = async (theme: CustomTheme) => {
    await updateSession({ customTheme: theme })
  }

  const handleSetMode = async (newMode: string) => {
    setMode(newMode)
    await updateSession({ preferences: { mode: newMode } })
  }

  const toggleMode = () => {
    handleSetMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider
      value={{
        themes,
        currentAccent,
        setCurrentAccent: handleSetCurrentAccent,
        addCustomTheme,
        mode,
        setMode: handleSetMode,
        toggleMode,
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme={mode}
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}
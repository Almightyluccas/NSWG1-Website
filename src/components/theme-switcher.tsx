"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Palette, Moon, Sun, Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { useThemeContext, type ThemeOption } from "@/lib/theme-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { themes, currentAccent, setCurrentAccent, addCustomTheme } = useThemeContext()
  const [isAddingTheme, setIsAddingTheme] = useState(false)
  const [newThemeName, setNewThemeName] = useState("")
  const [newThemeColor, setNewThemeColor] = useState("#DFC069")
  const [mounted, setMounted] = useState(false)

  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    // Ensure the theme is saved to localStorage
    localStorage.setItem('theme', newTheme)
  }

  const changeTheme = (theme: ThemeOption) => {
    setCurrentAccent(theme)
    setIsOpen(false)
  }

  const handleAddTheme = () => {
    // Convert hex to RGB
    const r = Number.parseInt(newThemeColor.slice(1, 3), 16)
    const g = Number.parseInt(newThemeColor.slice(3, 5), 16)
    const b = Number.parseInt(newThemeColor.slice(5, 7), 16)

    // Create darker variant (20% darker)
    const darkerR = Math.floor(r * 0.8)
    const darkerG = Math.floor(g * 0.8)
    const darkerB = Math.floor(b * 0.8)

    const newTheme: ThemeOption = {
      name: newThemeName,
      accent: `${r}, ${g}, ${b}`,
      accentDarker: `${darkerR}, ${darkerG}, ${darkerB}`,
    }

    addCustomTheme(newTheme)
    setCurrentAccent(newTheme)
    setIsAddingTheme(false)
    setNewThemeName("")
    setNewThemeColor("#DFC069")
  }

  if (!mounted) {
    return null // Prevent rendering until client-side
  }

  return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {/* Dark/Light Mode Toggle */}
        <Button
            onClick={toggleTheme}
            className="rounded-full w-12 h-12 flex items-center justify-center bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 shadow-lg"
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-accent" />}
        </Button>

        {/* Color Theme Switcher */}
        <div className="relative">
          <Button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full w-12 h-12 flex items-center justify-center bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 shadow-lg"
          >
            <Palette className="h-5 w-5 text-accent" />
          </Button>

          {isOpen && (
              <div className="absolute bottom-16 right-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-4 w-64 border border-gray-200 dark:border-zinc-700">
                <h3 className="text-sm font-medium mb-3">Choose Theme Color</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {themes.map((theme) => (
                      <button
                          key={theme.name}
                          onClick={() => changeTheme(theme)}
                          className={`flex items-center w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                              currentAccent.name === theme.name ? "bg-gray-100 dark:bg-zinc-700" : ""
                          }`}
                      >
                        <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: `rgb(${theme.accent})` }}></div>
                        <span className="text-sm">{theme.name}</span>
                      </button>
                  ))}
                </div>

                <Dialog open={isAddingTheme} onOpenChange={setIsAddingTheme}>
                  <DialogTrigger asChild>
                    <button className="flex items-center w-full p-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-dashed border-gray-300 dark:border-zinc-600">
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="text-sm">Add Custom Theme</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Theme</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme-name">Theme Name</Label>
                        <Input
                            id="theme-name"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            placeholder="My Custom Theme"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme-color">Theme Color</Label>
                        <div className="flex items-center gap-2">
                          <div
                              className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-600"
                              style={{ backgroundColor: newThemeColor }}
                          ></div>
                          <Input
                              id="theme-color"
                              type="color"
                              value={newThemeColor}
                              onChange={(e) => setNewThemeColor(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddTheme} disabled={!newThemeName.trim() || !newThemeColor} className="w-full">
                        Add Theme
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
          )}
        </div>
      </div>
  )
}
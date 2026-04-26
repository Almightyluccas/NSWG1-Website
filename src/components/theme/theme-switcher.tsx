"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Palette, Plus, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CustomTheme } from "@/types/database";

export type DashboardThemeToolbarPlacement = "header" | "sidebar";

type DashboardThemeToolbarProps = {
  /** Sidebar opens the palette to the right so it stays on screen. */
  placement?: DashboardThemeToolbarPlacement;
  /** Vertical stack for narrow sidebar (e.g. collapsed rail). */
  buttonLayout?: "horizontal" | "vertical";
};

/**
 * Dashboard accent + appearance controls (header or sidebar).
 * When `themeUserCustomizationEnabled` is false, controls are read-only.
 */
export function DashboardThemeToolbar({
  placement = "header",
  buttonLayout = "horizontal",
}: DashboardThemeToolbarProps) {
  const {
    mode,
    toggleMode,
    themes,
    currentAccent,
    setCurrentAccent,
    addCustomTheme,
    canUseLightMode,
    themeUserCustomizationEnabled,
  } = useTheme();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeColor, setNewThemeColor] = useState("#DFC069");
  const palettePopoverId = `dashboard-theme-palette-${placement}`;

  const changeTheme = (theme: CustomTheme) => {
    if (!themeUserCustomizationEnabled) return;
    setCurrentAccent(theme);
    setPaletteOpen(false);
  };

  const handleAddTheme = () => {
    const r = Number.parseInt(newThemeColor.slice(1, 3), 16);
    const g = Number.parseInt(newThemeColor.slice(3, 5), 16);
    const b = Number.parseInt(newThemeColor.slice(5, 7), 16);
    const darkerR = Math.floor(r * 0.8);
    const darkerG = Math.floor(g * 0.8);
    const darkerB = Math.floor(b * 0.8);
    const newTheme: CustomTheme = {
      name: newThemeName,
      accent: `${r}, ${g}, ${b}`,
      accentDarker: `${darkerR}, ${darkerG}, ${darkerB}`,
    };
    addCustomTheme(newTheme);
    setCurrentAccent(newTheme);
    setIsAddingTheme(false);
    setNewThemeName("");
    setNewThemeColor("#DFC069");
    setPaletteOpen(false);
  };

  const iconBtnClass =
    "p-2 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-accent";
  const disabledBtnClass =
    "p-2 rounded-lg text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-80";

  return (
    <div
      className={cn(
        "relative flex items-center",
        buttonLayout === "vertical"
          ? "flex-col gap-1"
          : "flex-row gap-0.5 sm:gap-1"
      )}
      aria-label="Theme appearance"
    >
      {canUseLightMode &&
        (themeUserCustomizationEnabled ? (
          <button
            type="button"
            onClick={toggleMode}
            className={iconBtnClass}
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {mode === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden />
            ) : (
              <Moon className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={disabledBtnClass}
            title="Light and dark mode are set by the unit and cannot be changed here."
          >
            {mode === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden />
            ) : (
              <Moon className="h-4 w-4" aria-hidden />
            )}
          </button>
        ))}

      {themeUserCustomizationEnabled ? (
        <>
          <Popover open={paletteOpen} onOpenChange={setPaletteOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={iconBtnClass}
                title="Accent color"
              >
                <Palette
                  className="h-4 w-4"
                  style={{ color: `rgb(${currentAccent.accent})` }}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              id={palettePopoverId}
              className="w-64 max-w-[min(16rem,calc(100vw-1.5rem))] max-h-[min(24rem,calc(100vh-2rem))] overflow-hidden flex flex-col border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 shadow-xl z-[200]"
              side={placement === "sidebar" ? "right" : "bottom"}
              align="end"
              sideOffset={8}
              collisionPadding={16}
              avoidCollisions
            >
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2 shrink-0">
                Accent color
              </h3>
              <div className="space-y-1 max-h-[min(13rem,calc(100vh-8rem))] overflow-y-auto min-h-0">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => changeTheme(theme)}
                    className={`flex items-center w-full p-2 rounded-md text-left text-sm transition-colors ${
                      currentAccent.name === theme.name
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full mr-2 shrink-0 ring-1 ring-zinc-300 dark:ring-zinc-600"
                      style={{ backgroundColor: `rgb(${theme.accent})` }}
                    />
                    <span className="truncate text-zinc-800 dark:text-zinc-200">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mt-2 flex items-center w-full p-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 shrink-0"
                onClick={() => {
                  setPaletteOpen(false);
                  setIsAddingTheme(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add custom
              </button>
            </PopoverContent>
          </Popover>

          <Dialog open={isAddingTheme} onOpenChange={setIsAddingTheme}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create custom accent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dash-theme-name">Name</Label>
                  <Input
                    id="dash-theme-name"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="My accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dash-theme-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-600"
                      style={{ backgroundColor: newThemeColor }}
                    />
                    <Input
                      id="dash-theme-color"
                      type="color"
                      value={newThemeColor}
                      onChange={(e) => setNewThemeColor(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddTheme}
                  disabled={!newThemeName.trim() || !newThemeColor}
                  className="w-full"
                >
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <button
          type="button"
          disabled
          className={disabledBtnClass}
          title="Accent color is set by the unit and cannot be changed here."
        >
          <Palette
            className="h-4 w-4"
            style={{ color: `rgb(${currentAccent.accent})` }}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

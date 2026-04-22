"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSession } from "next-auth/react";
import { CustomTheme, UserRole } from "@/types/database";
import { defaultThemes } from "@/lib/defaultThemes";
import {
  isLightModeEligibleRole,
  THEME_USER_CUSTOMIZATION_ENABLED,
} from "@/lib/themeAccess";

interface ThemeContextType {
  themes: CustomTheme[];
  currentAccent: CustomTheme;
  setCurrentAccent: (theme: CustomTheme) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  mode: string | undefined;
  setMode: (mode: string) => void;
  toggleMode: () => void;
  /** True only on /dashboard routes and when the user may use light mode. */
  canUseLightMode: boolean;
  /** False when accent / light-dark picks are locked for the unit. */
  themeUserCustomizationEnabled: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themes: defaultThemes,
  currentAccent: defaultThemes[1],
  setCurrentAccent: () => {},
  addCustomTheme: () => {},
  mode: "dark",
  setMode: () => {},
  toggleMode: () => {},
  canUseLightMode: false,
  themeUserCustomizationEnabled: THEME_USER_CUSTOMIZATION_ENABLED,
});

const DashboardRouteContext = createContext<
  ((allows: boolean) => void) | null
>(null);

export const useTheme = () => useContext(ThemeContext);

/**
 * Mount inside `dashboard/layout` so light/dark preference only applies there.
 * Public pages and `/admin` never register — they stay dark.
 */
export function DashboardLightModeScope({
  children,
}: {
  children: React.ReactNode;
}) {
  const setDashboardRoute = useContext(DashboardRouteContext);

  useEffect(() => {
    if (!setDashboardRoute) return;
    setDashboardRoute(true);
    return () => setDashboardRoute(false);
  }, [setDashboardRoute]);

  return <>{children}</>;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: CustomTheme;
}) {
  const { data: session, status, update: updateSession } = useSession();

  const isDefault = defaultThemes.some((t) => t.name === initialTheme.name);

  const [currentAccent, setCurrentAccent] = useState<CustomTheme>(initialTheme);
  const [themes, setThemes] = useState<CustomTheme[]>([
    ...defaultThemes,
    ...(!isDefault ? [initialTheme] : []),
  ]);
  /** Must not read `localStorage` in the initializer — server is always "dark" here; client sync runs in `useEffect`. */
  const [mode, setMode] = useState<string | undefined>("dark");

  const [onDashboardRoute, setOnDashboardRoute] = useState(false);

  const setDashboardRouteAllowsLight = useCallback((allows: boolean) => {
    setOnDashboardRoute(allows);
  }, []);

  const roleEligible = useMemo(() => {
    const roles = session?.user?.roles as UserRole[] | undefined;
    return isLightModeEligibleRole(roles);
  }, [session?.user?.roles]);

  const canUseLightMode = onDashboardRoute && roleEligible;

  const forcedTheme = canUseLightMode ? mode : "dark";

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const allThemes = [
        ...defaultThemes,
        ...(session.user.customThemes || []),
      ];
      setThemes(allThemes);
    }
  }, [status, session]);

  useEffect(() => {
    if (!canUseLightMode) {
      return;
    }

    const pref = session?.user?.preferences?.mode;
    if (pref === "light" || pref === "dark") {
      setMode(pref);
      if (
        THEME_USER_CUSTOMIZATION_ENABLED &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem("theme-mode", pref);
      }
      return;
    }

    if (!THEME_USER_CUSTOMIZATION_ENABLED) {
      return;
    }

    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("theme-mode")
        : null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
  }, [canUseLightMode, session?.user?.preferences?.mode]);

  useEffect(() => {
    if (!canUseLightMode && mode === "light") {
      setMode("dark");
    }
  }, [canUseLightMode, mode]);

  const applyAccentToDOM = (theme: CustomTheme) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--accent-color",
        theme.accent
      );
      document.documentElement.style.setProperty(
        "--accent-color-darker",
        theme.accentDarker
      );
    }
  };

  const handleSetCurrentAccent = async (theme: CustomTheme) => {
    if (!THEME_USER_CUSTOMIZATION_ENABLED) return;
    setCurrentAccent(theme);
    applyAccentToDOM(theme);
    await updateSession({ preferences: { activeThemeName: theme.name } });
  };

  const addCustomTheme = async (theme: CustomTheme) => {
    if (!THEME_USER_CUSTOMIZATION_ENABLED) return;
    await updateSession({ customTheme: theme });
  };

  const handleSetMode = async (newMode: string) => {
    if (!THEME_USER_CUSTOMIZATION_ENABLED || !canUseLightMode) {
      return;
    }
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", newMode);
    }
    await updateSession({ preferences: { mode: newMode } });
  };

  const toggleMode = () => {
    if (!THEME_USER_CUSTOMIZATION_ENABLED || !canUseLightMode) return;
    handleSetMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <DashboardRouteContext.Provider value={setDashboardRouteAllowsLight}>
      <ThemeContext.Provider
        value={{
          themes,
          currentAccent,
          setCurrentAccent: handleSetCurrentAccent,
          addCustomTheme,
          mode: canUseLightMode ? mode : "dark",
          setMode: handleSetMode,
          toggleMode,
          canUseLightMode,
          themeUserCustomizationEnabled: THEME_USER_CUSTOMIZATION_ENABLED,
        }}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme={forcedTheme}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </ThemeContext.Provider>
    </DashboardRouteContext.Provider>
  );
}

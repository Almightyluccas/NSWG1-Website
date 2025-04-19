import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeContextProvider } from "@/lib/theme-context"
import { ThemeSwitcher } from "@/components/theme-switcher"
import SessionWrapper from "@/components/auth/sessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Naval Special Warfare Group One",
  description: "Elite tactical team in Arma 3, where immersive simulations meet real-world tactics.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add script to prevent theme flashing during page load */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Check for theme in localStorage first
              try {
                let theme = localStorage.getItem('theme');
                let darkMode = theme === 'dark';
                
                // If no theme in localStorage, use system preference
                if (!theme) {
                  darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  theme = darkMode ? 'dark' : 'light';
                }
                
                // Apply theme immediately before rendering
                document.documentElement.classList[darkMode ? 'add' : 'remove']('dark');
                
                // Store theme if it's not already stored
                if (!localStorage.getItem('theme')) {
                  localStorage.setItem('theme', theme);
                }
                
                // Also apply accent theme if available
                const accentTheme = localStorage.getItem('accent-theme');
                if (accentTheme) {
                  try {
                    const theme = JSON.parse(accentTheme);
                    document.documentElement.style.setProperty('--accent-color', theme.accent);
                    document.documentElement.style.setProperty('--accent-color-darker', theme.accentDarker);
                  } catch (e) {
                    console.error('Failed to parse saved accent theme', e);
                  }
                }
              } catch (e) {
                // Fallback if localStorage is unavailable
                console.warn('Unable to access localStorage:', e);
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
      <SessionWrapper>
        <ThemeProvider>
          <ThemeContextProvider>
              {children}
              <ThemeSwitcher />
          </ThemeContextProvider>
        </ThemeProvider>
      </SessionWrapper>

      </body>
      </html>
  )
}

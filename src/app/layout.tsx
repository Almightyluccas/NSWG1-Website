import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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
      <body className={`${inter.variable} font-sans`}>
        <SessionWrapper>
          <ThemeProvider>
            {children}
            <ThemeSwitcher />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}

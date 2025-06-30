import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"
import SessionWrapper from "@/components/auth/sessionWrapper";
import  { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Naval Special Warfare Group One",
  description: "Elite tactical team in Arma 3, where immersive simulations meet real-world tactics.",
  icons: {
    icon: "/images/nswg1-emblem.png"
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <SessionWrapper session={session}>
          <ThemeProvider>
            {children}
            <ThemeSwitcher />
          </ThemeProvider>
          <Analytics />
        </SessionWrapper>
      </body>
    </html>
  )
}

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
import { SpeedInsights } from "@vercel/speed-insights/next"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Naval Special Warfare Group One | Arma 3 Milsim Unit",
  description:
    "Join Naval Special Warfare Group One — an elite Arma 3 milsim unit inspired by Navy SEAL Team 6. Experience tactical realism, teamwork, and immersive operations.",
  keywords: [
    "Arma 3",
    "Milsim",
    "Naval Special Warfare",
    "SEAL Team 6",
    "Tactical Simulation",
    "Military Roleplay",
    "NSWG1",
    "Arma 3 Units",
    "Special Forces Arma 3",
    "Red Squadron",
    "Arma",
    "Arma Units",
    "Seal Team"
  ],
  authors: [{ name: "Luccas Amorim" }],
  creator: "Luccas Amorim",
  publisher: "Naval Special Warfare Group One",
  robots: "index, follow",
  alternates: {
    canonical: "https://nswg1.vercel.app",
  },
  openGraph: {
    title: "Naval Special Warfare Group One | Arma 3 Milsim",
    description:
      "Elite Arma 3 milsim unit based on SEAL Team 6. Realistic training, authentic tactics, and immersive gameplay.",
    url: "https://nswg1.vercel.app",
    siteName: "NSWG1 Arma 3 Milsim",
    images: [
      {
        url: "/images/nswg1-emblem.png",
        width: 800,
        height: 600,
        alt: "NSWG1 Emblem",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naval Special Warfare Group One | Arma 3 Milsim",
    description:
      "Join our elite Arma 3 milsim team inspired by SEAL Team 6. Intense training, real tactics, immersive gameplay.",
    images: ["/images/nswg1-emblem.png"],
    creator: "@YourTwitterHandle",
  },
  icons: {
    icon: "/images/nswg1-emblem.png",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions);
  return (
    <>
      <meta name="google-site-verification" content="EnWMu1qqVWr54rRvXV-fpgiSRg1U-f0S7npdZ4Oti8o" />
      <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
      <SessionWrapper session={session}>
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </SessionWrapper>
      </body>
      </html>
    </>

  )
}

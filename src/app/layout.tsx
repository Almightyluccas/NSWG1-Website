import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import SessionWrapper from "@/components/auth/sessionWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { ThemeInitializer } from "@/components/theme/theme-initializer";
import { defaultThemes } from "@/lib/defaultThemes";
import { CustomTheme } from "@/types/database";
import { siteMetadata } from "@/config/metadata";
import { Toaster } from "sonner";
import SessionErrorHandler from "@/components/auth/sessionErrorHandler";
import { getAuthSession } from "@/lib/authOptions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = siteMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  const activeThemeName = session?.user?.preferences?.activeThemeName || "Red";
  const allThemes = [...defaultThemes, ...(session?.user?.customThemes || [])];
  const activeTheme: CustomTheme =
    allThemes.find((t) => t.name === activeThemeName) || defaultThemes[3];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeInitializer theme={activeTheme} />
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "sb9pbe9haz");
            `,
          }}
        />
        <SessionWrapper session={session}>
          <SessionErrorHandler />
          <ThemeProvider initialTheme={activeTheme}>
            {children}
            <Toaster theme="dark" richColors />
            <ThemeSwitcher />
            <CookieConsent />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </SessionWrapper>
      </body>
    </html>
  );
}

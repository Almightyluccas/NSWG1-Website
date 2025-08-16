"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Cookie } from "lucide-react"
import Link from "next/link"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowConsent(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowConsent(false)
  }

  const handleIgnore = () => {
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 md:max-w-md">
      <Card className="bg-zinc-900/95 border-zinc-800 backdrop-blur-sm shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 leading-relaxed">
                We use cookies to enhance your experience and analyze site usage.
                <Link href="/privacy" className="text-accent hover:text-accent/80 underline ml-1">
                  Learn more
                </Link>
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-black font-medium"
                >
                  Accept
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                >
                  Decline
                </Button>
              </div>
            </div>
            <Button
              onClick={handleIgnore}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

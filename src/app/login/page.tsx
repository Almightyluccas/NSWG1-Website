"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"
import Image from "next/image"
import { signIn, useSession } from "next-auth/react"

export default function LoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    useEffect(() => {
        if (status === "authenticated" && session) {
            router.push(callbackUrl)
        }
    }, [session, status, router, callbackUrl])

    const handleSignIn = async () => {
        await signIn('discord', {
            callbackUrl: callbackUrl,
            redirect: false
        })
    }

    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
          <Navbar />

          <div className="relative pt-20 min-h-screen flex items-center justify-center">
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-900 dark:to-zinc-900 z-10"></div>
                  <Image src="/images/join-background.png" alt="Login Background" fill className="object-cover opacity-40" />
              </div>

              <div className="container mx-auto px-4 z-10 py-16">
                  <FadeIn>
                      <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-6">
                              <div className="flex justify-center mb-6">
                                  <div className="relative w-16 h-16">
                                      <Image src="/images/nswg1-emblem.png" alt="NSWG1 Logo" fill className="object-contain" />
                                  </div>
                              </div>

                              <h1 className="text-2xl font-bold text-center mb-6">Sign in with Discord</h1>

                              <div className="space-y-4">
                                  <Button
                                    onClick={handleSignIn}
                                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center justify-center"
                                  >
                                      <>
                                          <svg
                                            className="h-5 w-5 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 127.14 96.36"
                                            fill="currentColor"
                                          >
                                              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                          </svg>
                                          Continue with Discord
                                      </>
                                  </Button>

                                  <div className="text-center text-sm text-gray-500 dark:text-zinc-400">
                                      By signing in, you agree to our Terms of Service and Privacy Policy.
                                  </div>
                              </div>
                          </div>
                      </div>
                  </FadeIn>
              </div>
          </div>
      </main>
    )
}
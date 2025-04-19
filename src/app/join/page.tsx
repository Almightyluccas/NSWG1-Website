"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2 } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import Image from "next/image"
import {useSession} from "next-auth/react";

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    age: "",
    experience: "",
    availability: "",
    reason: "",
    discord: "",
  })
  const router = useRouter()
  const { data: session } = useSession()
  useEffect(() => {
    if (!session && !isSubmitting) {
      router.push("/login")
    }
  }, [session, router, isSubmitting])

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        discord: `${session.user?.name}`,
      }))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (!session && !isSubmitted) {
    return null // Don't render anything while redirecting
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="relative pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10"></div>
          <Image src="/images/join-background.png" alt="Join NSWG1" fill className="object-cover" />
        </div>

        <div className="container mx-auto px-4 z-10 relative py-20">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4">
              Join <span className="text-accent">NSWG1</span>
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Apply to become part of our elite tactical team. Complete the form below to start your journey.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <FadeIn>
              {isSubmitted ? (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-medium mb-2">Application Submitted</h3>
                  <p className="text-gray-500 dark:text-zinc-400 mb-6">
                    Thank you for your interest in joining NSWG1. We&apos;ll review your application and get back to you
                    soon.
                  </p>
                  <Button onClick={() => router.push("/")} className="bg-accent hover:bg-accent-darker text-black">
                    Return to Home
                  </Button>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">Application Form</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="18"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Gaming Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years of experience with Arma 3"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="Days/times you're available for operations"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discord">Discord Username</Label>
                      <Input
                        id="discord"
                        name="discord"
                        value={formData.discord}
                        onChange={handleChange}
                        placeholder="username#1234"
                        required
                        disabled={!!session} // Disable if we have the user's Discord info
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Why do you want to join NSWG1?</Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Tell us why you want to join and what you can bring to the team..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent-darker text-black"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

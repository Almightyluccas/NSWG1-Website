"use server";

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FadeIn } from "@/components/fade-in"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Home } from "lucide-react"
import BackButton from "./back-button"

export default async function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="bg-red-500/10 dark:bg-red-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-12 w-12 text-red-500" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">
                Access <span className="text-accent">Unauthorized</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300">
                You don&apos;t have permission to view this page. This area requires higher clearance level or specific role assignment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <BackButton />

                <Button
                  className="flex items-center gap-2 bg-accent hover:bg-accent-darker text-black"
                  asChild
                >
                  <Link href="/">
                    <Home className="h-4 w-4 mr-1" />
                    Return to Home
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}
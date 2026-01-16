"use server";

import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import Image from "next/image"
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import JoinFormClient from "@/app/join/join-form.client";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";

export default async function JoinPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login");

  const roles = session.user.roles ?? [];
  if (roles.includes(UserRole.member)) {
    redirect("/");
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
            <div className="max-w-3xl mx-auto">
              <JoinFormClient></JoinFormClient>
            </div>
          </div>
        </section>

        <Footer />
      </main>
  )
}

"use server";

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FadeIn } from "@/components/fade-in"
import Image from "next/image"
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import JoinFormClient from "@/app/join/join-form.client";
import { ApplicationSubmissionResponse, CreatePerscomUser, PerscomUserResponse } from "@/types/perscomApi";
import { createPerscomUser, createApplicationSubmission } from "@/lib/perscomApi";
import { updateUserAfterApplicationDb } from "@/db/client";


export async function submitApplication(formData: FormData, user_id: string, discordName: string) {
  const session = await getServerSession(authOptions)

  if (!session) throw new Error("Not authenticated");

  const formEntries = Object.fromEntries(formData);
  const data = {
    name: formEntries.name?.toString() || "",
    email: formEntries.email?.toString() || "",
    dateOfBirth: new Date(formEntries.dateOfBirth?.toString()),
    steamId: formEntries.steamId?.toString() || "",
    hasPreviousExperience: formEntries.hasPreviousExperience?.toString() || "",
    previousUnits: formEntries.previousUnits?.toString() || "",
    reason: formEntries.reason?.toString() || "",
    timezone: formEntries.timezone?.toString() || "",
    armaExperience: parseInt(formEntries.armaExperience?.toString()),
    capabilities: formEntries.capabilities?.toString() || "",
    discordName: discordName,
    preferredPosition: formEntries.preferredPosition?.toString() || ""
  }

  const perscomUser: CreatePerscomUser = { name: data.name, email: data.email }
  const createPerscomUserResponse: PerscomUserResponse = await createPerscomUser(perscomUser);
  if (!createPerscomUserResponse) throw new Error("Failed to create perscom user");

  const applicationResponse: ApplicationSubmissionResponse = await createApplicationSubmission(
    {
      form_id: 1,
      user_id: createPerscomUserResponse.data.id,
      arma_3_id: data.steamId,
      first_name: data.name,
      discord_name: data.discordName,
      date_of_birth: data.dateOfBirth.toISOString(),
      email_address: data.email as string,
      previous_unit: `${data.hasPreviousExperience}. ${data.previousUnits}`,
      preferred_position: data.preferredPosition,
      what_is_your_time_zone: data.timezone,
      arma_experience_in_hours: data.armaExperience,
      why_do_you_want_to_join_red_squadron: data.reason,
      what_makes_you_more_capable_than_other_candidates: data.capabilities,
      confirm_you_have_read_and_understand_the_recruitment_requirements_on_our_website: "yes",
    }
  );
  if (!applicationResponse) throw new Error("Failed to create application submission");

  await updateUserAfterApplicationDb(user_id, createPerscomUserResponse.data.id, createPerscomUserResponse.data.name, data.steamId, data.dateOfBirth)
}

export default async function JoinPage() {
  const session = getServerSession(authOptions)

  if (!session) redirect("/login");

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

import { ApplicationSubmissionResponse, CreatePerscomUser, PerscomUserResponse } from "@/types/perscomApi";
import { createPerscomUser, createApplicationSubmission } from "@/lib/perscomApi";
import { updateUserAfterApplicationDb } from "@/db/client";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";


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
      user_id: createPerscomUserResponse.id,
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

  await updateUserAfterApplicationDb(user_id, createPerscomUserResponse.id, createPerscomUserResponse.name, data.steamId, data.dateOfBirth)
}

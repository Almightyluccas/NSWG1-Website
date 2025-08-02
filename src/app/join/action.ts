"use server"

import {
  ApplicationSubmissionResponse,
  CreatePerscomUser,
  PerscomUserCreationResponse,
  PerscomUserResponse
} from "@/types/perscomApi";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { perscom } from "@/lib/perscom/api";
import { database } from "@/database";
import { InstructorWebhook } from "@/lib/discord/InstructorWebhook";


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

  let createPerscomUserResponse: PerscomUserCreationResponse;
  try {
    const perscomUser: CreatePerscomUser = { name: data.name, email: data.email };
    createPerscomUserResponse = await perscom.post.user(perscomUser);
  } catch (error: any) {
    const isEmailTakenError = error?.errorBody?.error?.message === 'The email has already been taken.';

    if (isEmailTakenError) {
      try {
        const allUsers: PerscomUserResponse[] = await perscom.get.users();
        const existingUser = allUsers.find(user => user.email === data.email);

        if (!existingUser?.id) {
          throw new Error('**PERSCOM_REPLACE_NOT_FOUND**');
        }

        await perscom.delete.user(existingUser.id);

        const perscomUser: CreatePerscomUser = { name: data.name, email: data.email };
        createPerscomUserResponse = await perscom.post.user(perscomUser);

      } catch (retryError) {
        console.error("Error during PERSCOM user replacement process:", retryError);
        throw new Error('**PERSCOM_REPLACE_FAILED**');
      }
    } else {
      console.error("PERSCOM User Creation Error:", error);
      throw new Error('**PERSCOM_CREATE_FAILED**');
    }
  }

  if (!createPerscomUserResponse?.data?.id) {
    throw new Error("Invalid response from PERSCOM user creation after all attempts.");
  }


  try {
    const applicationResponse: ApplicationSubmissionResponse = await perscom.post.applicationSubmission(
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
    if (!applicationResponse) {
      throw new Error("Invalid response from PERSCOM application submission.");
    }
  } catch(error) {
    console.error("PERSCOM Application Submission Error:", error);
    throw new Error("An error occurred with the PERSCOM service during application submission.");
  }

  const discord = new InstructorWebhook

  try {
    await discord.sendMessage({
      name: 'submission',
      candidateDiscordId: user_id,
      candidateName: data.name,
      applyingPosition: data.preferredPosition,
      unit: data.preferredPosition.includes('Special Warfare') ? 'tacdevron' : '160th',
    });
  } catch (error) {
    console.error("Discord Message Error:", error);
  }


  try {
    await database.put.userAfterApplication(user_id, createPerscomUserResponse.data.id, createPerscomUserResponse.data.name, data.steamId, data.dateOfBirth)
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error("An error occurred while updating the user database.");
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { perscom } from "@/lib/perscom/api";
import { database } from "@/database";
import { CandidateWebhook } from "@/lib/discord/CandidateWebhook";
import { ReasonKey, Units } from "@/types/api/discord";

export async function acceptApplication(
  submissionId: number,
  perscomId: number,
  name: string,
  email: string,
  applyingPosition: string,
  unit: Units
): Promise<void> {
  await perscom.post.submissionStatus(submissionId, "Accepted");
  await database.put.userRoleByPerscomId("candidate", perscomId);
  await perscom.patch.userApproval(perscomId, true, name);
  await perscom.post.clearPerscomCache();
  revalidatePath("/admin/perscom/submissions/enlistment");

  const discordId = await database.get.discordIdByPerscomId(perscomId);
  const discord = new CandidateWebhook();

  await discord.sendMessage({
    name: "accepted",
    candidateName: name,
    candidateDiscordId: discordId || "",
    applyingPosition: applyingPosition,
    unit: unit,
  });
}

export async function rejectApplication(
  submissionId: number,
  perscomId: number,
  reason: ReasonKey,
  name: string,
  applyingPosition: string,
  unit: Units,
  customReason?: string
): Promise<void> {
  await perscom.post.submissionStatus(submissionId, "Denied");
  await database.put.userRoleByPerscomId("guest", perscomId);
  await perscom.post.clearPerscomCache();
  revalidatePath("/admin/perscom/submissions/enlistment");

  const discordId = await database.get.discordIdByPerscomId(perscomId);
  const discord = new CandidateWebhook();
  await discord.sendMessage({
    name: "rejected",
    candidateName: name,
    candidateDiscordId: discordId || "",
    applyingPosition: applyingPosition,
    unit: unit,
    reasonKey: reason,
    customReason: customReason || undefined,
  });
}

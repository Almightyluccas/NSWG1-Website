"use server";

import { revalidatePath } from "next/cache";
import { perscom } from "@/lib/perscom/api";

export async function acceptApplication(
  submissionId: number,
  perscomId: number,
  name: string,
  email: string
) {
  await perscom.post.submissionStatus(submissionId, "Accepted");
  revalidatePath("/admin/perscom/submissions/enlistment");

  //TODO: change user in database to be on leave
  //TODO: add sending message to discord
}

export async function rejectApplication(
  submissionId: number,
  perscomId: number
) {
  await perscom.post.submissionStatus(submissionId, "Denied");
  revalidatePath("/admin/perscom/submissions/enlistment");

  //TODO: change user in database to have denied leave
  //TODO: add sending message to discord
}

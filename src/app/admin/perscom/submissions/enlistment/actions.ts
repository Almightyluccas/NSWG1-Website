"use server"

import { changeSubmissionStatus, changeUserApprovedBoolean } from "@/lib/perscomApi";
import { updateUserRolePerscomIdDb } from "@/db/client";
import { revalidatePath } from 'next/cache';

export async function acceptApplication(submissionId: number, perscomId: number, name: string, email: string) {
  await changeSubmissionStatus(submissionId, 'Accepted');
  await updateUserRolePerscomIdDb('member', perscomId);
  await changeUserApprovedBoolean(true, perscomId, name, email);
  revalidatePath('/admin/perscom/submissions/enlistment');
  //TODO: add sending message to discord
}

export async function rejectApplication(submissionId: number, perscomId: number) {
  console.log(submissionId);
  await changeSubmissionStatus(submissionId, 'Denied');
  await updateUserRolePerscomIdDb('guest', perscomId);
  revalidatePath('/admin/perscom/submissions/enlistment');
  //TODO: add sending message to discord
}
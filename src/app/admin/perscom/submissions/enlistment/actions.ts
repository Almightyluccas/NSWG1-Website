"use server"

import { revalidatePath } from 'next/cache';
import { perscom } from "@/lib/perscom/api";
import { database } from "@/database";

export async function acceptApplication(submissionId: number, perscomId: number, name: string, email: string) {
  await perscom.post.submissionStatus(submissionId, 'Accepted');
  await database.put.userRoleByPerscomId('member', perscomId);
  await perscom.patch.userApproval(perscomId, true, name, email);
  perscom.invalidateCache('applications');
  await perscom.post.clearPerscomCache()
  revalidatePath('/admin/perscom/submissions/enlistment');
  //TODO: add sending message to discord
}

export async function rejectApplication(submissionId: number, perscomId: number) {
  await perscom.post.submissionStatus(submissionId, 'Denied');
  await database.put.userRoleByPerscomId('guest', perscomId);
  perscom.invalidateCache('applications');
  await perscom.post.clearPerscomCache()
  revalidatePath('/admin/perscom/submissions/enlistment');
  //TODO: add sending message to discord
}
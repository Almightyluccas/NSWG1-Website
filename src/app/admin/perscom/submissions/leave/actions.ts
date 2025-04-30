import { changeSubmissionStatus } from "@/lib/perscomApi";
import { revalidatePath } from "next/cache";

export async function acceptApplication(submissionId: number, perscomId: number, name: string, email: string) {
  console.log(submissionId);
  await changeSubmissionStatus(submissionId, 'Accepted');
  revalidatePath('/admin/perscom/submissions/enlistment');

  //TODO: change user in database to be on leave
  //TODO: add sending message to discord
}

export async function rejectApplication(submissionId: number, perscomId: number) {
  console.log(submissionId);
  await changeSubmissionStatus(submissionId, 'Denied');
  revalidatePath('/admin/perscom/submissions/enlistment');

  //TODO: change user in database to have denied leave
  //TODO: add sending message to discord
}

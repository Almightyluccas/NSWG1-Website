"use server"

import { ApplicationsTable } from "@/app/admin/perscom/submissions/enlistment/applications.client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getApplications, changeUserApprovedBoolean, changeSubmissionStatus } from "@/lib/perscomApi";
import { ApplicationData } from "@/types/perscomApi";
import { updateUserRolePerscomIdDb } from "@/db/client";

export async function acceptApplication(submissionId: number, perscomId: number, name: string, email: string) {
  await changeSubmissionStatus(submissionId, 'Accepted');
  await updateUserRolePerscomIdDb('member', perscomId);
  await changeUserApprovedBoolean(true, perscomId, name, email);
  //TODO: add sending message to discord
}

export async function rejectApplication(submissionId: number, perscomId: number) {
  await changeSubmissionStatus(submissionId, 'Denied');
  await updateUserRolePerscomIdDb('guest', perscomId);
}

// TODO: Implement caching of applications and users.


export default async function EnlistmentApplicationsPage() {
  const session = getServerSession(authOptions);
  if (!session) redirect("/");

  const applications: ApplicationData[] = await getApplications();
  applications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enlistment Applications</h1>
        <p className="text-gray-500 dark:text-zinc-400">Review and process new enlistment applications.</p>
      </div>

      <ApplicationsTable applications={applications} />
    </div>

  )
}

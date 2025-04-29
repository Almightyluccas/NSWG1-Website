"use server"

import { getApplications, changeSubmissionStatus } from "@/lib/perscomApi";
import { LeaveApplication } from "@/types/perscomApi";
import { revalidatePath } from 'next/cache';
import { UserRole } from "@/types/database";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { LeaveOfAbsenceTable } from "./leave.client";


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



export default async function LeaveOfAbsencePage() {
  const applications = await getApplications()
    .then(applications => applications.filter(app => app.form_id === 4))
    .then(filtered => filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )) as unknown as LeaveApplication[];

  return (
    <ServerRoleGuard allowedRoles={[UserRole.instructor, UserRole.admin, UserRole.superAdmin, UserRole.developer]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leave of absence requests</h1>
          <p className="text-gray-500 dark:text-zinc-400">Review and process new LOA requests.</p>
        </div>

        <LeaveOfAbsenceTable applications={applications} />
      </div>
    </ServerRoleGuard>

  )
}

"use server"

import { getApplications, changeSubmissionStatus } from "@/lib/perscomApi";
import { LeaveApplication } from "@/types/perscomApi";
import { revalidatePath } from 'next/cache';
import { UserRole } from "@/types/database";
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { LeaveOfAbsenceTable } from "./leave.client";



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

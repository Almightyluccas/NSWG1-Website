"use server"

import { ApplicationsTable } from "@/app/admin/perscom/submissions/enlistment/applications.client";
import { getApplications, changeUserApprovedBoolean, changeSubmissionStatus } from "@/lib/perscomApi";
import { ApplicationData } from "@/types/perscomApi";
import { updateUserRolePerscomIdDb } from "@/db/client";
import { revalidatePath } from 'next/cache';
import ServerRoleGuard from "@/components/auth/server-role-guard";
import { UserRole } from "@/types/database";



export default async function EnlistmentApplicationsPage() {
  const applications: ApplicationData[] = await getApplications()
    .then(applications => applications.filter(app => app.form_id === 1))
    .then(filtered => filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));


  return (
    <ServerRoleGuard allowedRoles={[UserRole.instructor, UserRole.admin, UserRole.superAdmin, UserRole.developer]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Enlistment Applications</h1>
          <p className="text-gray-500 dark:text-zinc-400">Review and process new enlistment applications.</p>
        </div>

        <ApplicationsTable applications={applications} />
      </div>
    </ServerRoleGuard>
  )
}
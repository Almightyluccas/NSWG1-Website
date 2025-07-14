import { notFound } from "next/navigation"
import { getFormWithQuestions, getFormSubmissions } from "@/app/admin/forms/actions" // Updated import path
import { FormSubmissionsClient } from "./form-submissions-client"
import ServerRoleGuard from "@/components/auth/server-role-guard"

interface FormSubmissionsPageProps {
  params: Promise<{ id: string }>
}

export default async function FormSubmissionsPage({ params }: FormSubmissionsPageProps) {
  const resolvedParams = await params
  const formId = Number.parseInt(resolvedParams.id)

  if (isNaN(formId)) {
    notFound()
  }

  const form = await getFormWithQuestions(formId)
  if (!form) {
    notFound()
  }

  const submissions = await getFormSubmissions(formId)

  return (
    <ServerRoleGuard allowedRoles={["admin", "superAdmin"]}>
      <FormSubmissionsClient form={form} initialSubmissions={submissions} />
    </ServerRoleGuard>
  )
}

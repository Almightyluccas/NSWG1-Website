import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/authOptions"

interface ServerRoleGuardProps {
  allowedRoles: string[]
  hide?: boolean
  children: ReactNode
}

export default async function ServerRoleGuard({
  allowedRoles,
  hide = false,
  children,
}: ServerRoleGuardProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const roles = session.user.roles ?? []
  console.log(roles)
  const isAllowed = allowedRoles.some(r => roles.includes(r))

  if (!isAllowed && hide) {
    return null
  }

  if (!isAllowed) {
    redirect("/unauthorized")
  }

  return <>{children}</>
}
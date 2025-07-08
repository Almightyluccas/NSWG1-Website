"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  Briefcase,
  UserCheck,
  Building2,
  Home,
  ImageIcon,
} from "lucide-react"
import { useSession } from "next-auth/react";
import RoleGuard from "@/components/auth/role-guard";
import { UserRole } from "@/types/database";

interface SidebarProps {
  className?: string
}

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [perscomOpen, setPerscomOpen] = useState(true)
  const [submissionsOpen, setSubmissionsOpen] = useState(false)
  const [organizationOpen, setOrganizationOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const { data: session } = useSession();


  useEffect(() => {
    if (!perscomOpen) {
      setPerscomOpen(true)
    }
  }, [perscomOpen])

  if (!visible) {
    return (
      <div className="fixed left-0 top-0 z-20 h-screen flex items-start">
        <button
          onClick={() => setVisible(true)}
          className="p-2 m-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 h-screen flex flex-col",
        className,
      )}
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute top-4 right-4 p-1 bg-gray-100 dark:bg-zinc-700 rounded"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold">
          <span className="text-accent">NSWG1</span> Admin
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin"
                  ? "bg-accent text-black"
                  : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </li>
          <RoleGuard roles={session?.user.roles || []} allowedRoles={['admin', 'superAdmin']} hide={true}>
            <li>
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/users"
                    ? "bg-accent text-black"
                    : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                )}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/admin/gallery"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/gallery"
                    ? "bg-accent text-black"
                    : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                )}
              >
                <ImageIcon className="h-4 w-4" />
                Gallery Management
              </Link>
            </li>
            <li>
              <Link
                href="/admin/forms"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/admin/forms"
                    ? "bg-accent text-black"
                    : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                )}
              >
                <FileText className="h-4 w-4 text-primary" />
                Forms
              </Link>
            </li>
          </RoleGuard>
          <li className="mt-6">
            <div
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => setPerscomOpen(!perscomOpen)}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4" />
                <span>PERSCOM</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", perscomOpen ? "transform rotate-180" : "")} />
            </div>

            {perscomOpen && (
              <ul className="mt-1 ml-4 space-y-1">
                <RoleGuard roles={session?.user.roles || []} allowedRoles={[UserRole.developer] } hide={true}>
                  <li>
                    <Link
                      href="/admin/perscom/configuration"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === "/admin/perscom/configuration"
                          ? "bg-accent text-black"
                          : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      Configuration
                    </Link>
                  </li>
                </RoleGuard>
                <li>
                  <Link
                    href="/admin/perscom/members"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === "/admin/perscom/users"
                        ? "bg-accent text-black"
                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                    )}
                  >
                    <UserCheck className="h-4 w-4" />
                    Members
                  </Link>
                </li>

                <li>
                  <div
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700"
                    onClick={() => setSubmissionsOpen(!submissionsOpen)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <span>Submissions</span>
                    </div>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", submissionsOpen ? "transform rotate-180" : "")}
                    />
                  </div>

                  {submissionsOpen && (
                    <ul className="mt-1 ml-4 space-y-1">
                      <li>
                        <Link
                          href="/admin/perscom/submissions/enlistment"
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === "/admin/perscom/submissions/enlistment"
                              ? "bg-accent text-black"
                              : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                          )}
                        >
                          Enlistment Applications
                        </Link>
                      </li>
                      <RoleGuard roles={session?.user.roles || []} allowedRoles={['admin', 'superAdmin']} hide={true}>
                        <li>
                          <Link
                            href="/admin/perscom/submissions/leave"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/submissions/leave"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Leave of Absence
                          </Link>
                        </li>
                        <RoleGuard roles={session?.user.roles || []} allowedRoles={[UserRole.developer]} hide={true}>
                          <li>
                            <Link
                              href="/admin/perscom/submissions/all"
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname === "/admin/perscom/submissions/all"
                                  ? "bg-accent text-black"
                                  : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                              )}
                            >
                              All Submissions
                            </Link>
                          </li>
                        </RoleGuard>

                      </RoleGuard>
                    </ul>
                  )}
                </li>
                <RoleGuard roles={session?.user.roles || []} allowedRoles={[UserRole.developer]} hide={true}>
                  <li>
                    <div
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => setOrganizationOpen(!organizationOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4" />
                        <span>Organization</span>
                      </div>
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", organizationOpen ? "transform rotate-180" : "")}
                      />
                    </div>

                    {organizationOpen && (
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>
                          <Link
                            href="/admin/perscom/organization/units"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/units"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Units
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/perscom/organization/positions"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/positions"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Positions
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/perscom/organization/specialties"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/specialties"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Specialties
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/perscom/organization/statuses"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/statuses"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Statuses
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/perscom/organization/awards"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/awards"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Awards
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/perscom/organization/qualifications"
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname === "/admin/perscom/organization/qualifications"
                                ? "bg-accent text-black"
                                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
                            )}
                          >
                            Qualifications
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                </RoleGuard>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
        >
          <Home className="h-4 w-4" />
          Return to Website
        </Link>
      </div>
    </div>
  )
}

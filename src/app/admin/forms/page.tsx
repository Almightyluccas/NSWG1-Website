import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Plus, Eye, Edit, BarChart3, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { getAdminForms } from "./actions"

async function FormsContent() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const forms = await getAdminForms()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Forms Management</h1>
          <p className="text-muted-foreground">Create and manage forms for your organization</p>
        </div>
        <Button className="bg-accent">
          <Plus className=" h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Forms</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.filter((f) => f.status === "active").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
          <CardDescription>Manage your organization's forms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none">{form.name}</h3>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{form.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(form.status)} className=" text-xs">
                        {getStatusIcon(form.status)}
                        <span className="ml-1">{form.status}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {form.created_at.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    {form.id === "loa-form-default" ? (
                      <Link href={`/admin/perscom/submissions/leave`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Submissions
                      </Link>
                    ) : (
                      <Link href={`/admin/forms/${form.id}/submissions`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Submissions
                      </Link>
                    )}
                  </Button>
                  {/* Hide edit button for LOA form */}
                  {form.id !== "loa-form-default" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/forms/${form.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {forms.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Forms Created</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                Get started by creating your first form for users to fill out
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FormsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminFormsPage() {
  return (
    <ServerRoleGuard allowedRoles={["admin", "moderator"]}>
      <Suspense fallback={<FormsLoading />}>
        <FormsContent />
      </Suspense>
    </ServerRoleGuard>
  )
}

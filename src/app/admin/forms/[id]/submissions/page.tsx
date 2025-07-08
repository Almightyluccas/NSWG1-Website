import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect, notFound } from "next/navigation"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Eye, CheckCircle, XCircle, Clock, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getFormById, getFormSubmissions } from "../../actions"

interface SubmissionsPageProps {
  params: {
    id: string
  }
}

async function SubmissionsContent({ params }: SubmissionsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const form = await getFormById(params.id)
  const submissions = await getFormSubmissions(params.id)

  if (!form) {
    notFound()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved":
        return "default"
      case "denied":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/forms">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{form.name} - Submissions</h1>
          <p className="text-muted-foreground">Review and manage form submissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "approved").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>All submissions for this form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted/50">{getStatusIcon(submission.status)}</div>
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none">{submission.user_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted {submission.created_at.toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(submission.status)} className="text-xs">
                        {submission.status}
                      </Badge>
                      {submission.reviewed_at && (
                        <span className="text-xs text-muted-foreground">
                          Reviewed {submission.reviewed_at.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/forms/${params.id}/submissions/${submission.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Submissions will appear here once users start filling out this form
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  return (
    <ServerRoleGuard allowedRoles={["admin", "moderator"]}>
        <SubmissionsContent params={params} />
    </ServerRoleGuard>
  )
}

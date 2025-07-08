import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getForms } from "./action"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

async function FormsContent() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const forms = await getForms()
  const activeForms = forms.filter((form) => form.status === "active")

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
            <p className="text-muted-foreground text-lg">Submit requests and applications through our official forms</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {activeForms.map((form) => (
            <Card
              key={form.id}
              className="group hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{form.name}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(form.status)} className="shrink-0">
                    {getStatusIcon(form.status)}
                    <span className="ml-1">{form.status}</span>
                  </Badge>
                </div>
                {form.description && (
                  <CardDescription className="text-base leading-relaxed">{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-accent w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href={`/forms/${form.id}`}>
                    Fill Out Form
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeForms.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Forms Available</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                There are currently no active forms available for submission.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function FormsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FormsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<FormsLoading />}>
          <FormsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect, notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { database } from "@/database"
import { LOAForm } from "@/components/forms/loa-form"
import { GenericForm } from "@/components/forms/generic-form"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface FormPageProps {
  params: {
    id: string
  }
}

async function FormContent({ params }: FormPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const form = await database.get.formById(params.id)

  if (!form || form.status !== "active") {
    notFound()
  }

  // Special handling for LOA form
  if (params.id === "loa-form-default") {
    return <LOAForm user={session.user} />
  }

  // Generic form handling
  return <GenericForm form={form} user={session.user} />
}

function FormLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FormPage({ params }: FormPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<FormLoading />}>
          <FormContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

import { Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { FormsClient } from "./forms-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ListChecks } from "lucide-react"

export default function FormsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Forms</h1>
              <p className="text-muted-foreground text-lg">Access and fill out available forms</p>
            </div>

            <div className="flex justify-center mb-8">
              <Link href="/forms/my-submissions" passHref>
                <Button>
                  <ListChecks className="mr-2 h-4 w-4" />
                  My Submissions
                </Button>
              </Link>
            </div>

            <Suspense
              fallback={
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                      ))}
                    </div>
                  </div>
                </div>
              }
            >
              <FormsClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

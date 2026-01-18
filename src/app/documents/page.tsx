import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DocumentsClient } from "./documents-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Documents</h1>
              <p className="text-muted-foreground text-lg">
                View and download important documents
              </p>
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
              <DocumentsClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

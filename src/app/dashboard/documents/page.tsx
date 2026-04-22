import { Suspense } from "react";
import { DocumentsClient } from "./documents-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/authOptions";

export default async function DocumentsPage() {
  const session = await getAuthSession();
  const roles = session?.user?.roles ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Documents Center
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Official Document Repository
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
        <DocumentsClient roles={roles} />
      </Suspense>
    </div>
  );
}

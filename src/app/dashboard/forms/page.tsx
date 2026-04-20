import { Suspense } from "react";
import Link from "next/link";
import { FormsClient } from "./forms-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

export default function FormsPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Forms
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Access and fill out available forms
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Link href="/dashboard/forms/my-submissions" passHref>
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
  );
}

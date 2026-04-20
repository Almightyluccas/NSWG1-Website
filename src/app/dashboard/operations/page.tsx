import { Suspense } from "react";
import { OperationsClient } from "./operations-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperationsPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Operations Center
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider">
          Command & Control // Joint Operations Registry
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        }
      >
        <OperationsClient />
      </Suspense>
    </div>
  );
}

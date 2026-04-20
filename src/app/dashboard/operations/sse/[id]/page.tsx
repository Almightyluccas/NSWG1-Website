import { Suspense } from "react";
import { SseDetailClient } from "./sse-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          SSE Record Review
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Intelligence Exploitation // SYS_ID: {id}
        </p>
      </div>

      <Suspense
        fallback={<Skeleton className="h-[600px] w-full rounded-lg" />}
      >
        <SseDetailClient id={id} />
      </Suspense>
    </div>
  );
}

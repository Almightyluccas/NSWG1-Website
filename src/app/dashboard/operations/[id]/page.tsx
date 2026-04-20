import { Suspense } from "react";
import { OperationDetailClient } from "./operation-detail";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function OperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/operations"
        className="inline-flex items-center text-xs font-mono text-zinc-500 hover:text-accent transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        BACK TO OPERATIONS CENTER
      </Link>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        }
      >
        <OperationDetailClient id={id} />
      </Suspense>
    </div>
  );
}

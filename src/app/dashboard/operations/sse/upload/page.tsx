import { Suspense } from "react";
import { SseUploadClient } from "./sse-upload-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SseUploadPage({
  searchParams,
}: {
  searchParams?: Promise<{ campaignId?: string; missionId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Upload SSE Record
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Sensitive Site Exploitation // Secure Data Intake
        </p>
      </div>

      <Suspense
        fallback={<Skeleton className="h-[600px] w-full max-w-4xl rounded-lg" />}
      >
        <SseUploadClient
          initialCampaignId={params.campaignId}
          initialMissionId={params.missionId}
        />
      </Suspense>
    </div>
  );
}

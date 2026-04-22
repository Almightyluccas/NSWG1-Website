import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { DocUploadClient } from "./doc-upload-client";

export default async function DocUploadPage({
  searchParams,
}: {
  searchParams?: Promise<{ campaignId?: string; missionId?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  const params = (await searchParams) ?? {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Upload Operation Document
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Planning Docs // Secure Document Intake
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full max-w-4xl rounded-lg" />}>
        <DocUploadClient initialCampaignId={params.campaignId} initialMissionId={params.missionId} />
      </Suspense>
    </div>
  );
}

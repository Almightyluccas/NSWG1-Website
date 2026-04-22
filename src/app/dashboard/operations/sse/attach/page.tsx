import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { SseAttachClient } from "./sse-attach-client";

export default async function SseAttachPage({
  searchParams,
}: {
  searchParams?: Promise<{ campaignId?: string; missionId?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }
  const params = (await searchParams) ?? {};
  if (!params.campaignId || !params.missionId) {
    redirect("/dashboard/operations/management");
  }
  return <SseAttachClient campaignId={params.campaignId} missionId={params.missionId} />;
}

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { DocsAttachClient } from "./docs-attach-client";

export default async function DocsAttachPage({
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
  return (
    <DocsAttachClient
      campaignId={params.campaignId}
      missionId={params.missionId}
    />
  );
}

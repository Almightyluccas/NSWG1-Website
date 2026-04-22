import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/database";
import { MissionIntelClient } from "./mission-intel.client";

export default async function MissionIntelPage({
  params,
}: {
  params: Promise<{ id: string; missionId: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  const { id, missionId } = await params;
  return <MissionIntelClient campaignId={id} missionId={missionId} />;
}

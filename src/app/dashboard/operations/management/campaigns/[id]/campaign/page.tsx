import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { CampaignManageClient } from "../campaign-manage.client";
import { UserRole } from "@/types/database";

export default async function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  const { id } = await params;
  if (!id) redirect("/dashboard/operations/management");

  return <CampaignManageClient id={id} view="campaign" />;
}

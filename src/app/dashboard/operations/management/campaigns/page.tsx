import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { CampaignListClient } from "./campaigns-list.client";
import { UserRole } from "@/types/database";

export default async function CampaignsListPage() {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  return <CampaignListClient />;
}

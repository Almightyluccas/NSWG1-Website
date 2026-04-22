import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { NewCampaignClient } from "./new-campaign.client";
import { UserRole } from "@/types/database";

export default async function NewCampaignPage() {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  return <NewCampaignClient />;
}


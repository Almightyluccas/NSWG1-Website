import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { TrainingListClient } from "./training-list.client";
import { UserRole } from "@/types/database";

export default async function TrainingListPage() {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  return <TrainingListClient />;
}

import { getAuthSession } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { NewTrainingClient } from "./new-training.client";
import { UserRole } from "@/types/database";

export default async function NewTrainingPage() {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  return <NewTrainingClient />;
}


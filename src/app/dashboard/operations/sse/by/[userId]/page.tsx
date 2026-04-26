import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { redirect } from "next/navigation";
import { SseByUserClient } from "./sse-by-user-client";

export default async function SseByUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.member)) {
    redirect("/dashboard/operations/sse");
  }

  const { userId } = await params;
  return <SseByUserClient userId={userId} />;
}

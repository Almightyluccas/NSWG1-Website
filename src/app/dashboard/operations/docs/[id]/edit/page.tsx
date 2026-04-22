import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { DocEditClient } from "./doc-edit-client";

export default async function DocEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/operations");
  }

  const { id } = await params;
  return <DocEditClient id={id} />;
}

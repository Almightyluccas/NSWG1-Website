import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authOptions";
import { UserRole } from "@/types/database";
import { DocumentsUploadClient } from "./documents-upload-client";

export default async function DocumentsUploadPage() {
  const session = await getAuthSession();
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    redirect("/dashboard/documents");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1.5 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          Upload Document
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wider">
          Documents Center // Admin Intake
        </p>
      </div>
      <DocumentsUploadClient />
    </div>
  );
}

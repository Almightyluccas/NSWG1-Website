import { database } from "@/database";
import { UserRole } from "@/types/database";

type AdminAlertInput = {
  label: string;
  message: string;
  type?: "info" | "priority" | "warning";
  createdBy: string;
  expiresAt?: string | null;
};

export async function postAdminAlert(input: AdminAlertInput): Promise<void> {
  try {
    await database.post.alert({
      type: input.type ?? "info",
      label: input.label,
      message: input.message,
      targetRoles: UserRole.admin,
      expiresAt: input.expiresAt ?? undefined,
      createdBy: input.createdBy,
    });
  } catch (error) {
    console.error("postAdminAlert failed:", error);
  }
}

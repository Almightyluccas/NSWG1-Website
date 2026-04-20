import type { AlertItem } from "@/types/dashboard";

export function perscomRowToAlertItem(
  row: {
    id: number;
    event: string;
    type: string;
    label: string;
    message: string;
    created_at: Date | string;
  },
  opts?: { dismissible?: boolean }
): AlertItem {
  return {
    id: row.id,
    source: "perscom",
    event: row.event,
    dismissible: opts?.dismissible ?? true,
    type: row.type as AlertItem["type"],
    label: row.label,
    message: row.message,
    target_roles: null,
    is_active: true,
    expires_at: null,
    created_by: "perscom",
    creator_name: "PERSCOM",
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : row.created_at.toISOString(),
  };
}

export function withSystemSource(row: AlertItem): AlertItem {
  return { ...row, source: "system", event: row.event ?? null };
}

export function mergeAndSortAlerts(
  system: AlertItem[],
  perscom: AlertItem[]
): AlertItem[] {
  return [...system, ...perscom].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

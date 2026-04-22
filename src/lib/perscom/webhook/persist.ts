import { database } from "@/database";
import type { AlertItem } from "@/types/dashboard";

/** Best-effort: Perscom payload shapes vary by event. */
export function extractTargetPerscomId(
  event: string,
  payload: unknown
): number | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;

  const coercedId = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
    return null;
  };

  if (event.startsWith("user.")) {
    const data = p.data;
    if (data && typeof data === "object") {
      const id = coercedId((data as Record<string, unknown>).id);
      if (id !== null) return id;
    }
    const id = coercedId(p.id);
    if (id !== null) return id;
  }

  const topUser = coercedId(p.user_id);
  if (topUser !== null) return topUser;

  const data = p.data;
  if (data && typeof data === "object") {
    const uid = coercedId((data as Record<string, unknown>).user_id);
    if (uid !== null) return uid;
  }

  return null;
}

export function buildPerscomNotificationCopy(event: string): {
  type: AlertItem["type"];
  label: string;
  message: string;
} {
  const label = "PERSCOM";
  const words = event.split(".").join(" ");
  const readable = words.replace(/\b\w/g, (c) => c.toUpperCase()) || event;
  let type: AlertItem["type"] = "info";
  if (event.includes(".deleted")) type = "warning";
  if (event.startsWith("submission.")) type = "warning";
  return {
    type,
    label,
    message: `Personnel update: ${readable}.`,
  };
}

export async function persistPerscomWebhookNotification(
  event: string,
  payload: unknown
): Promise<void> {
  if (event === "webhook.test") return;

  const targetPerscomId = extractTargetPerscomId(event, payload);
  if (targetPerscomId === null) {
    console.info(
      JSON.stringify({
        source: "perscom-webhook",
        note: "skip_notification_no_target_perscom_id",
        event,
      })
    );
    return;
  }

  const { type, label, message } = buildPerscomNotificationCopy(event);
  await database.post.perscomNotification({
    targetPerscomId,
    event,
    type,
    label,
    message,
  });
}

import type { PerscomWebhookEnvelope } from "@/types/perscom-webhook";

export function parsePerscomWebhookPayload(rawBody: string): {
  event: string;
  payload: unknown;
} {
  let data: PerscomWebhookEnvelope;
  try {
    data = JSON.parse(rawBody) as PerscomWebhookEnvelope;
  } catch {
    throw new Error("INVALID_JSON");
  }

  const event =
    typeof data.event === "string"
      ? data.event
      : typeof data.type === "string"
        ? data.type
        : "unknown";

  return { event, payload: data };
}

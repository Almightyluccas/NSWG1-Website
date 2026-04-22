/**
 * Minimal envelope for inbound Perscom webhooks.
 * Full payload shape varies by event; keep extras loose until documented.
 */
export type PerscomWebhookEnvelope = {
  event?: string;
  type?: string;
  data?: unknown;
} & Record<string, unknown>;

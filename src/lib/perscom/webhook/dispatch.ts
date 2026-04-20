function payloadKeySummary(payload: unknown): { payloadKeys: string[] } {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return {
      payloadKeys: Object.keys(payload as Record<string, unknown>).slice(0, 32),
    };
  }
  return { payloadKeys: [] };
}

function logWebhook(event: string, payload: unknown, note?: string): void {
  const { payloadKeys } = payloadKeySummary(payload);
  console.info(
    JSON.stringify({
      source: "perscom-webhook",
      event,
      ...(note ? { note } : {}),
      payloadKeys,
    })
  );
}

/**
 * Log-only dispatch. Add per-event branches here when you need side effects.
 * Documented event names: user.*, *record.*, calendar.*, event.*, message.*, submission.*, webhook.test
 */
export function dispatchPerscomWebhook(event: string, payload: unknown): void {
  if (event === "webhook.test") {
    logWebhook(event, payload, "test");
    return;
  }
  logWebhook(event, payload);
}

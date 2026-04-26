import { NextRequest, NextResponse } from "next/server";
import {
  dispatchPerscomWebhook,
  parsePerscomWebhookPayload,
  persistPerscomWebhookNotification,
  verifyPerscomSignature,
} from "@/lib/perscom/webhook";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, service: "perscom-webhook" });
}

export async function POST(request: NextRequest) {
  const secret = process.env.PERSCOM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("perscom-webhook: PERSCOM_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("Signature");

  if (!verifyPerscomSignature(rawBody, signature, secret)) {
    console.warn("perscom-webhook: invalid or missing signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: string;
  let payload: unknown;
  try {
    const parsed = parsePerscomWebhookPayload(rawBody);
    event = parsed.event;
    payload = parsed.payload;
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_JSON") {
      console.warn("perscom-webhook: invalid JSON body");
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    throw e;
  }

  dispatchPerscomWebhook(event, payload);

  try {
    await persistPerscomWebhookNotification(event, payload);
  } catch (e) {
    console.error("perscom-webhook: failed to persist notification", e);
  }

  return NextResponse.json({ ok: true });
}

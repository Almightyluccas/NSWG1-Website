import { DiscordWebhookPayload } from "@/types/discord";

export class DiscordWebhook {
  url: string

  constructor(url: string) {
    this.url = url;
  }

  async send(payload: DiscordWebhookPayload) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to send webhook: ${response.status}`);
    }
    return response.json();
  }
}
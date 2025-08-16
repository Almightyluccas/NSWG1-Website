import { DiscordWebhookPayload } from "@/types/api/discord";

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
      const errorBody = await response.text();
      console.error("Discord Webhook Error:", errorBody);
      throw new Error(`Failed to send webhook: ${response.status}`);
    }

    if (response.status === 204) return;

    return response.json();
  }
}
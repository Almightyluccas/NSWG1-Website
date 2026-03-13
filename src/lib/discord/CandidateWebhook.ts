import { DiscordWebhook } from "@/lib/discord/Discord";
import {
  CandidateMessageType,
  DiscordWebhookPayload,
} from "@/types/api/discord";

export class CandidateWebhook extends DiscordWebhook {
  constructor() {
    if (!process.env.WEBHOOK_URL_DISCORD_CANDIDATE)
      throw new Error("WEBHOOK_URL_DISCORD_CANDIDATE is not set");
    super(process.env.WEBHOOK_URL_DISCORD_CANDIDATE);
  }

  private formatMessage(data: CandidateMessageType): DiscordWebhookPayload {
    switch (data.name) {
      case "accepted":
        const instructorsMention =
          data.applyingPosition === "160th"
            ? "<@249242679211196417>"
            : "<@492142030831616010>";
        return {
          embeds: [
            {
              title: "Application Accepted",
              description: `Congratulations <@${data.candidateDiscordId}>, your application was accepted! Please contact ${instructorsMention} for an interview`,
              color: 65280,
            },
          ],
        };

      case "rejected": {
        const defaultReasons: Record<string, string> = {
          age: "The applicant's age does not meet the requirement.",
          lackOfEffort:
            "The application lacked sufficient effort. You are welcome to re-apply after putting more thought into your answers.",
          default: "The applicant does not meet our requirements.",
        };

        const reason =
          data.customReason ||
          defaultReasons[data.reasonKey] ||
          defaultReasons.default;

        const description = data.candidateDiscordId
          ? `<@${data.candidateDiscordId}>, your application has been denied.`
          : "The application has been denied.";

        const embedColor =
          data.reasonKey === "lackOfEffort" ? 16776960 : 16711680;

        return {
          embeds: [
            {
              title: "Application Rejected",
              description: description,
              color: embedColor,
              fields: [
                {
                  name: "Reason",
                  value: reason,
                  inline: false,
                },
              ],
            },
          ],
        };
      }
    }
  }

  async sendMessage(data: CandidateMessageType): Promise<any> {
    const payload: DiscordWebhookPayload = this.formatMessage(data);
    return super.send(payload);
  }
}

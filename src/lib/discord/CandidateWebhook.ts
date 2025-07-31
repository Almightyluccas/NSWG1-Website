import { DiscordWebhook } from "@/lib/discord/Discord";
import { CandidateMessageType, DiscordWebhookPayload } from "@/types/discord";

export class CandidateWebhook extends DiscordWebhook {

  constructor() {
    if (!process.env.WEBHOOK_URL_DISCORD_CANDIDATE) throw new Error('WEBHOOK_URL_DISCORD_CANDIDATE is not set');
    super(process.env.WEBHOOK_URL_DISCORD_CANDIDATE)
  }

  private formatMessage(data: CandidateMessageType): DiscordWebhookPayload {
    switch (data.name) {
      case 'accepted':
        if (data.applyingPosition === '160th') {
          return {
            embeds: [{
              title: "Application Accepted",
              description: `Congratulations <@${data.candidateDiscordId}>, your application was accepted! Please contact either <@667833642248175673>, <@492142030831616010> or <@1015660008534454282> for an interview`,
              color: 65280
            }]
          };
        }
        return {
          embeds: [{
            title: "Application Accepted",
            description: `Congratulations <@${data.candidateDiscordId}>, your application was accepted! Please contact <@249242679211196417> for an interview`,
            color: 65280
          }]
        };

      case 'rejected': {
        const defaultReasons: Record<string, string> = {
          age: "The applicant's age does not meet the requirement.",
          lackOfEffort: "The application lacked sufficient effort.",
          default: "No specific reason was provided."
        };

        const reason = data.customReason || defaultReasons[data.reasonKey] || defaultReasons.default;

        const description = data.candidateDiscordId
          ? `<@${data.candidateDiscordId}>, your application has been denied.`
          : 'The application has been denied.';

        return {
          embeds: [{
            title: "Application Rejected",
            description: description,
            color: 16711680,
            fields: [
              {
                name: 'Reason',
                value: reason,
                inline: false
              }
            ]
          }]
        };
      }

    }
  }

  async sendMessage(data: CandidateMessageType): Promise<any> {
    const payload: DiscordWebhookPayload = this.formatMessage(data);
    return super.send(payload)
  }

}
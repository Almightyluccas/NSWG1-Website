import { DiscordWebhook } from "@/lib/discord/Discord";
import { CandidateMessageType, DiscordWebhookPayload, InstructorMessageType, MessageType } from "@/types/discord";

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
              description: `Congratulations <@${data.candidateDiscordId}>, your application was accepted! Please contact 
              <@667833642248175673> or <@492142030831616010> or <@1015660008534454282> for an interview`,
              color: 65280
            }]
          };
        }
        return {
          embeds: [{
            title: "Application Accepted",
            description: `Congratulations <@${data.candidateDiscordId}>, your application was accepted! Please contact 
            <@249242679211196417> for an interview`,
            color: 65280
          }]
        };

      case 'rejected': {
        const defaultReasons: Record<string, string> = {
          age: "The applicant's age does not meet the requirement.",
          lack_of_effort: "The application lacked sufficient effort.",
          default: "The application was rejected for unspecified reasons."
        };

        if (data.customReason) {
          return {
            embeds: [{
              title: "Application Rejected",
              description: `Submission denied: ${data.customReason}`,
              color: 16711680
            }]
          };
        } else if (data.reasonKey && defaultReasons[data.reasonKey]) {
          return {
            embeds: [{
              title: "Application Rejected",
              description: `Submission denied: ${defaultReasons[data.reasonKey]}`,
              color: 16711680
            }]
          };
        }
      }
    }
  }

  async sendMessage(data: CandidateMessageType): Promise<any> {
    const payload: DiscordWebhookPayload = this.formatMessage(data);
    return super.send(payload)
  }

}
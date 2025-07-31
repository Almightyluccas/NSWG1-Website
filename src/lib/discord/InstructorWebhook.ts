import { DiscordWebhook } from "@/lib/discord/Discord";
import { DiscordWebhookPayload, InstructorMessageType, MessageType } from "@/types/discord";

export class InstructorWebhook extends DiscordWebhook {

  constructor() {
    if (!process.env.WEBHOOK_URL_DISCORD_INSTRUCTOR) throw new Error('WEBHOOK_URL_DISCORD_INSTRUCTOR is not set');
    super(process.env.WEBHOOK_URL_DISCORD_INSTRUCTOR)
  }

  private formatMessage(data : InstructorMessageType): DiscordWebhookPayload  {
    const mentions = data.unit === '160th'
      ? '<@249242679211196417>'
      : '<@667833642248175673><@492142030831616010><@1015660008534454282>';

    return {
      embeds: [{
        title: 'New Submission',
        description: `${mentions} please review this application.`,
        color: 255,
        fields: [
          {
            name: 'Applicant Name',
            value: data.candidateName,
            inline: true
          },
          {
            name: 'Discord',
            value: `<@${data.candidateDiscordId}>`,
            inline: true
          },
          {
            name: 'Position',
            value: data.applyingPosition,
            inline: true
          }
        ]
      }]
    };
  }

  async sendMessage(data: InstructorMessageType): Promise<string> {
    const payload: DiscordWebhookPayload = this.formatMessage(data);
    return super.send(payload)
  }

}
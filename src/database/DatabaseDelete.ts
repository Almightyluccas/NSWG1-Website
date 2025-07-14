import type { DatabaseClient } from "./DatabaseClient"

export class DatabaseDelete {
  constructor(private client: DatabaseClient) {}

  async recurringTraining(recurringId: string): Promise<void> {
    await this.client.query(`DELETE FROM recurring_trainings WHERE id = ?`, [recurringId])
  }

  async recurringTrainingInstances(recurringId: string): Promise<void> {
    await this.client.query(`DELETE FROM recurring_training_instances WHERE recurring_training_id = ?`, [recurringId])
  }

  async campaign(campaignId: string): Promise<void> {
    await this.client.query(
      `DELETE mr FROM mission_rsvps mr JOIN missions m ON mr.mission_id = m.id WHERE m.campaign_id = ?`,
      [campaignId],
    )
    await this.client.query(`DELETE FROM missions WHERE campaign_id = ?`, [campaignId])
    await this.client.query(`DELETE FROM campaigns WHERE id = ?`, [campaignId])
  }

  async mission(missionId: string): Promise<void> {
    await this.client.query(`DELETE FROM mission_rsvps WHERE mission_id = ?`, [missionId])
    await this.client.query(`DELETE FROM missions WHERE id = ?`, [missionId])
  }

  async trainingRecord(trainingId: string): Promise<void> {
    await this.client.query(`DELETE FROM training_rsvps WHERE training_id = ?`, [trainingId])
    await this.client.query(`DELETE FROM training_records WHERE id = ?`, [trainingId])
  }

  async deleteFormQuestionsByFormId(formId: number): Promise<void> {
    await this.client.query(`DELETE FROM form_questions WHERE form_id = ?`, [formId])
  }
}

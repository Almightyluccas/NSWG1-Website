import type { DatabaseClient } from "./DatabaseClient"

export class DatabaseDelete {
  constructor(private client: DatabaseClient) {}

  async recurringTraining(recurringId: string): Promise<void> {
    await this.client.query(`DELETE FROM recurring_trainings WHERE id = ?`, [recurringId])
  }

  async recurringTrainingInstances(recurringId: string): Promise<void> {
    await this.client.query(`DELETE FROM recurring_training_instances WHERE recurring_training_id = ?`, [recurringId])
  }
}

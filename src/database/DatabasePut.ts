import type { DatabaseClient } from "./DatabaseClient"
import type { UpdateRecurringTrainingData } from "@/types/recurring-training"

export class DatabasePut {
  constructor(private client: DatabaseClient) {}

  async userAfterApplication(
    id: string,
    perscom_id: number,
    name: string,
    steam_id: string,
    date_of_birth: Date,
  ): Promise<void> {
    await this.client.query(
      `
          UPDATE users
          SET perscom_id = ?, name = ?, date_of_birth = ?, steam_id = ?, role = 'applicant'
          WHERE id = ?
      `,
      [perscom_id, name, date_of_birth, steam_id, id],
    )
  }

  async userRoleByPerscomId(roles: string | string[], perscomId: number): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(",") : roles
    await this.client.query(
      `
          UPDATE users
          SET role = ?
          WHERE perscom_id = ?
      `,
      [roleString, perscomId],
    )
  }

  async userRoleByUserId(roles: string | string[], userId: string): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(",") : roles
    await this.client.query(
      `
          UPDATE users
          SET role = ?
          WHERE id = ?
      `,
      [roleString, userId],
    )
  }

  async userRefreshToken(userId: string, refreshToken: string | null, expiresAt: number | null): Promise<void> {
    await this.client.query(
      `
          UPDATE users SET refresh_token = ?, refresh_token_expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND) WHERE id = ?
      `,
      [refreshToken, expiresAt, userId],
    )
  }

  async campaignStatus(campaignId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE campaigns
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, campaignId],
    )
  }

  async campaignEndDate(campaignId: string, endDate: string): Promise<void> {
    await this.client.query(
      `
          UPDATE campaigns
          SET end_date = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [endDate, campaignId],
    )
  }

  async missionStatus(missionId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE missions
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, missionId],
    )
  }

  async trainingStatus(trainingId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE training_records
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, trainingId],
    )
  }

  // Recurring Training methods
  async recurringTraining(id: string, data: UpdateRecurringTrainingData): Promise<void> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push("description = ?")
      values.push(data.description)
    }
    if (data.dayOfWeek !== undefined) {
      updates.push("day_of_week = ?")
      values.push(data.dayOfWeek)
    }
    if (data.time !== undefined) {
      updates.push("time = ?")
      values.push(data.time)
    }
    if (data.location !== undefined) {
      updates.push("location = ?")
      values.push(data.location)
    }
    if (data.instructor !== undefined) {
      updates.push("instructor = ?")
      values.push(data.instructor || null)
    }
    if (data.maxPersonnel !== undefined) {
      updates.push("max_personnel = ?")
      values.push(data.maxPersonnel || null)
    }
    if (data.isActive !== undefined) {
      updates.push("is_active = ?")
      values.push(data.isActive)
    }

    if (updates.length === 0) {
      return
    }

    updates.push("updated_at = NOW()")
    values.push(id)

    await this.client.query(`UPDATE recurring_trainings SET ${updates.join(", ")} WHERE id = ?`, values)
  }

  async recurringTrainingInstanceCount(recurringId: string): Promise<void> {
    await this.client.query(
      `UPDATE recurring_trainings SET instances_created = instances_created + 1, updated_at = NOW() WHERE id = ?`,
      [recurringId],
    )
  }
}

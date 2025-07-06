import type { DatabaseClient } from "./DatabaseClient"
import type { CreateRecurringTrainingData } from "@/types/recurring-training"

export class DatabasePost {
  constructor(private client: DatabaseClient) {}

  async user(id: string, discord_username: string, email: string): Promise<void> {
    await this.client.query(
      `
          INSERT IGNORE INTO users (id, discord_username, email)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
                               discord_username = VALUES(discord_username),
                               email = VALUES(email)
      `,
      [id, discord_username, email],
    )
  }

  async refreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.client.query(
      `
          INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
          VALUES (?, ?, ?)
      `,
      [userId, tokenHash, expiresAt],
    )
  }

  async userProfileImage(userId: string, imageUrl: string): Promise<number | null> {
    const result = await this.client.query<any>(
      `
          INSERT INTO images (author_id, image_url, image_type)
          VALUES (?, ?, 'profile')
      `,
      [userId, imageUrl, userId]
    )

    const imageId = result.insertId
    await this.client.query(
      `
          UPDATE users SET profile_image_id = ? WHERE id = ?
      `,
      [imageId, userId],
    )

    return imageId
  }

  // Campaign methods
  async campaign(data: {
    id: string
    name: string
    description: string
    startDate: string
    endDate: string
    status: string
    createdBy: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO campaigns (id, name, description, start_date, end_date, status, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [data.id, data.name, data.description, data.startDate, data.endDate, data.status, data.createdBy],
    )
  }

  async mission(data: {
    id: string
    campaignId: string
    name: string
    description: string
    date: string
    time: string
    location: string
    maxPersonnel?: number
    status: string
    createdBy: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO missions (id, campaign_id, name, description, date, time, location, max_personnel, status, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        data.id,
        data.campaignId,
        data.name,
        data.description,
        data.date,
        data.time,
        data.location,
        data.maxPersonnel || null,
        data.status,
        data.createdBy,
      ],
    )
  }

  async missionRSVP(data: {
    id: string
    missionId: string
    userId: string
    userName: string
    status: string
    notes?: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO mission_rsvps (id, mission_id, user_id, user_name, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
                               status = VALUES(status),
                               notes = VALUES(notes),
                               updated_at = NOW()
      `,
      [data.id, data.missionId, data.userId, data.userName, data.status, data.notes || null],
    )
  }

  async missionAttendance(data: {
    id: string
    missionId: string
    userId: string
    userName: string
    status: string
    notes?: string
    markedBy: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO mission_attendance (id, mission_id, user_id, user_name, status, notes, marked_by, marked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
                               status = VALUES(status),
                               notes = VALUES(notes),
                               marked_by = VALUES(marked_by),
                               marked_at = NOW()
      `,
      [data.id, data.missionId, data.userId, data.userName, data.status, data.notes || null, data.markedBy],
    )
  }

  // Training methods
  async trainingRecord(data: {
    id: string
    name: string
    description: string
    date: string
    time: string
    location: string
    instructor?: string
    maxPersonnel?: number
    status: string
    createdBy: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO training_records (id, name, description, date, time, location, instructor, max_personnel, status, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        data.id,
        data.name,
        data.description,
        data.date,
        data.time,
        data.location,
        data.instructor || null,
        data.maxPersonnel || null,
        data.status,
        data.createdBy,
      ],
    )
  }

  async trainingRSVP(data: {
    id: string
    trainingId: string
    userId: string
    userName: string
    status: string
    notes?: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO training_rsvps (id, training_id, user_id, user_name, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
                               status = VALUES(status),
                               notes = VALUES(notes),
                               updated_at = NOW()
      `,
      [data.id, data.trainingId, data.userId, data.userName, data.status, data.notes || null],
    )
  }

  async trainingAttendance(data: {
    id: string
    trainingId: string
    userId: string
    userName: string
    status: string
    notes?: string
    markedBy: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO training_attendance (id, training_id, user_id, user_name, status, notes, marked_by, marked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
                               status = VALUES(status),
                               notes = VALUES(notes),
                               marked_by = VALUES(marked_by),
                               marked_at = NOW()
      `,
      [data.id, data.trainingId, data.userId, data.userName, data.status, data.notes || null, data.markedBy],
    )
  }

  // Recurring Training methods
  async recurringTraining(data: CreateRecurringTrainingData & { id: string; createdBy: string }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO recurring_trainings (id, name, description, day_of_week, time, location, instructor, max_personnel, is_active, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
      `,
      [
        data.id,
        data.name,
        data.description,
        data.dayOfWeek,
        data.time,
        data.location,
        data.instructor || null,
        data.maxPersonnel || null,
        data.createdBy,
      ],
    )
  }

  async recurringTrainingInstance(data: {
    id: string
    recurringTrainingId: string
    trainingId: string
    scheduledDate: string
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO recurring_training_instances (id, recurring_training_id, training_id, scheduled_date)
          VALUES (?, ?, ?, ?)
      `,
      [data.id, data.recurringTrainingId, data.trainingId, data.scheduledDate],
    )
  }
}

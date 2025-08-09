import type { DatabaseClient } from "./DatabaseClient"
import type { CreateRecurringTrainingData } from "@/types/recurring-training"
import type { FormQuestion } from "@/types/forms"
import {CustomTheme} from "@/types/database";

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

  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.client.query(
      `
          INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?)
      `,
      [userId, tokenHash, expiresAt, ipAddress, userAgent],
    );
  }

  async userProfileImage(userId: string, imageUrl: string): Promise<number | null> {
    const [existingUser] = await this.client.query<any>(
      `
      SELECT profile_image_id FROM users WHERE id = ?
    `,
      [userId],
    );
    if (existingUser && existingUser.profile_image_id) {
      console.log(`User ${userId} already has a profile image set. Skipping.`);
      return null;
    }
    const result = await this.client.query<any>(
      `
      INSERT INTO images (author_id, image_url, image_type)
      VALUES (?, ?, 'profile')
    `,
      [userId, imageUrl],
    );
    const imageId = result.insertId;
    await this.client.query(
      `
          UPDATE users SET profile_image_id = ? WHERE id = ?
      `,
      [imageId, userId],
    );
    return imageId;
  }

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

  // Forms methods
  async createFormDefinition(title: string, description: string, createdBy: string): Promise<number> {
    const formResult = await this.client.query<any>(
      `INSERT INTO form_definitions (title, description, created_by)
       VALUES (?, ?, ?)`,
      [title, description, createdBy],
    )
    return formResult.insertId
  }

  async createFormQuestion(
    formId: number,
    question: Omit<FormQuestion, "id" | "form_id" | "created_at">,
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO form_questions (form_id, question_text, question_type, is_required, options, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        formId,
        question.question_text.trim(),
        question.question_type,
        question.is_required || false,
        question.options ? JSON.stringify(question.options) : null,
        question.order_index,
      ],
    )
  }

  async createFormSubmission(formId: number, userId?: string, userName?: string, userEmail?: string): Promise<number> {
    const submissionResult = await this.client.query<any>(
      `INSERT INTO form_submissions (form_id, user_id, user_name, user_email)
       VALUES (?, ?, ?, ?)`,
      [formId, userId, userName, userEmail],
    )
    return submissionResult.insertId
  }

  async createFormSubmissionAnswer(submissionId: number, questionId: number, answerText: string): Promise<void> {
    await this.client.query(
      `INSERT INTO form_submission_answers (submission_id, question_id, answer_text)
       VALUES (?, ?, ?)`,
      [submissionId, questionId, answerText],
    )
  }

  // Document methods
  async logDocumentAccess(
    documentPath: string,
    documentName: string,
    accessType: "view" | "download",
    userId?: string,
    userName?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO document_access_logs (document_path, document_name, user_id, user_name, access_type, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [documentPath, documentName, userId, userName, accessType, ipAddress, userAgent],
    )
  }

  async userCustomTheme(userId: string, theme: CustomTheme): Promise<void> {
    await this.client.query(
      `INSERT INTO user_custom_themes (user_id, name, accent_rgb, accent_darker_rgb)
       VALUES (?, ?, ?, ?)`,
      [userId, theme.name, theme.accent, theme.accentDarker],
    )
  }

  async defaultUserPreferences(userId: string): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO user_preferences (user_id, active_theme_name, homepage_image_url)
       VALUES (?, ?, ?)`,
      [userId, "Red", "/images/tacdev/default.png"],
    )
  }
}

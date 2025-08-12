import type { DatabaseClient } from "./DatabaseClient"
import type { UpdateRecurringTrainingData } from "@/types/recurring-training"
import {Preferences} from "@/types/database";
import {GalleryItem} from "@/types/objectStorage";

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

  async userPreferences(preferences: Preferences, userId: string): Promise<void> {
    const setClauses: string[] = [];
    const queryParams: any[] = [];

    if (preferences.activeThemeName) {
      setClauses.push("active_theme_name = ?");
      queryParams.push(preferences.activeThemeName);
    }
    if (preferences.homepageImageUrl) {
      setClauses.push("homepage_image_url = ?");
      queryParams.push(preferences.homepageImageUrl);
    }
    if (setClauses.length === 0) {
      return;
    }
    queryParams.push(userId);

    const sqlQuery = `
    UPDATE user_preferences
    SET ${setClauses.join(", ")}
    WHERE user_id = ?;
  `;

    await this.client.query(sqlQuery, queryParams);
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

  async userName(id: string, name: string): Promise<void> {
    await this.client.query(
      `
          UPDATE users
          SET name = ?
          WHERE id = ?
      `,
      [name, id],
    )
  }
  async userProfilePicture(s3Key: string, userId: string): Promise<void> {
    const existingUserRows = await this.client.query<any[]>(
      `SELECT profile_image_id FROM users WHERE id = ?`,
      [userId]
    );

    const oldImageId = existingUserRows?.[0]?.profile_image_id || null;

    const insertResult = await this.client.query<any>(
      `
          INSERT INTO images (image_url, image_type, author_id)
          VALUES (?, 'profile', ?)
      `,
      [s3Key, userId]
    );

    const newImageId = insertResult.insertId;

    if (!newImageId) {
      throw new Error("Failed to insert new image record into the database.");
    }

    await this.client.query(
      `
          UPDATE users SET profile_image_id = ? WHERE id = ?
      `,
      [newImageId, userId]
    );

    if (oldImageId) {
      await this.client.query(
        `DELETE FROM images WHERE id = ? AND image_type = 'profile'`,
        [oldImageId]
      );
    }
  }

  async userCustomHeroImage(s3Key: string, userId: string): Promise<void> {
    await this.client.query<any[]>(
      `INSERT INTO images (image_url, image_type, category, author_id) VALUES (?, ?, ?, ?)`,
      [s3Key, 'hero', 'Misc', userId]
    );
  }

  async galleryImage(s3Key: string, userId: string, galleryItem: GalleryItem): Promise<void> {
    await this.client.query(
      `INSERT INTO images (image_url, image_type, category, title, alt_text, description, unit, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s3Key, 'Gallery', galleryItem.category, galleryItem.title, galleryItem.altText, galleryItem.description, galleryItem.unit, userId]
    )
  }

  async updateRefreshToken(oldTokenHash: string, newTokenHash: string, newExpiresAt: Date): Promise<void> {
    await this.client.query(
      `UPDATE refresh_tokens SET token_hash = ?, expires_at = ? WHERE token_hash = ?`,
      [newTokenHash, newExpiresAt, oldTokenHash],
    );
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.client.query(
      `
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?
    `,
      [tokenHash],
    );
  }

  async campaign(
    campaignId: string,
    data: {
      name: string
      description: string
      startDate: string
      endDate: string
    },
  ): Promise<void> {
    await this.client.query(
      `UPDATE campaigns SET name = ?, description = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?`,
      [data.name, data.description, data.startDate, data.endDate, campaignId],
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

  async mission(
    missionId: string,
    data: {
      name: string
      description: string
      date: string
      time: string
      location: string
      maxPersonnel?: number
    },
  ): Promise<void> {
    await this.client.query(
      `UPDATE missions SET name = ?, description = ?, date = ?, time = ?, location = ?, max_personnel = ?, updated_at = NOW() WHERE id = ?`,
      [data.name, data.description, data.date, data.time, data.location, data.maxPersonnel || null, missionId],
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

  async trainingRecord(
    trainingId: string,
    data: {
      name: string
      description: string
      date: string
      time: string
      location: string
      instructor?: string
      maxPersonnel?: number
    },
  ): Promise<void> {
    await this.client.query(
      `UPDATE training_records SET name = ?, description = ?, date = ?, time = ?, location = ?, instructor = ?, max_personnel = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name,
        data.description,
        data.date,
        data.time,
        data.location,
        data.instructor || null,
        data.maxPersonnel || null,
        trainingId,
      ],
    )
  }

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

  async updateFormDefinition(formId: number, title: string, description: string): Promise<void> {
    await this.client.query(
      `UPDATE form_definitions 
       SET title = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, formId],
    )
  }

  async updateFormSubmissionStatus(
    submissionId: number,
    status: "pending" | "reviewed" | "approved" | "rejected",
    reviewedBy: string,
    notes?: string,
  ): Promise<void> {
    await this.client.query(
      `UPDATE form_submissions
       SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ?
       WHERE id = ?`,
      [status, reviewedBy, notes, submissionId],
    )
  }

  async updateFormActiveStatus(formId: number, isActive: boolean): Promise<void> {
    await this.client.query(`UPDATE form_definitions SET is_active = ? WHERE id = ?`, [isActive, formId])
  }

}

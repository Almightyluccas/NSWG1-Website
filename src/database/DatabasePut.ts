import type { DatabaseClient } from "./DatabaseClient";
import type { UpdateRecurringTrainingData } from "@/types/recurring-training";
import { Preferences } from "@/types/database";

export class DatabasePut {
  constructor(private client: DatabaseClient) {}

  async userAfterApplication(
    id: string,
    perscom_id: number,
    name: string,
    steam_id: string,
    date_of_birth: Date
  ): Promise<void> {
    await this.client.query(
      `
          UPDATE users
          SET perscom_id = ?, name = ?, date_of_birth = ?, steam_id = ?, role = 'applicant'
          WHERE id = ?
      `,
      [perscom_id, name, date_of_birth, steam_id, id]
    );
  }

  async userPreferences(
    preferences: Preferences,
    userId: string
  ): Promise<void> {
    const setClauses: string[] = [];
    const queryParams: any[] = [];

    if (preferences.activeThemeName) {
      setClauses.push("active_theme_name = ?");
      queryParams.push(preferences.activeThemeName);
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

  async userRoleByPerscomId(
    roles: string | string[],
    perscomId: number
  ): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(",") : roles;
    await this.client.query(
      `
          UPDATE users
          SET role = ?
          WHERE perscom_id = ?
      `,
      [roleString, perscomId]
    );
  }

  async userRoleByUserId(
    roles: string | string[],
    userId: string
  ): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(",") : roles;
    await this.client.query(
      `
          UPDATE users
          SET role = ?
          WHERE id = ?
      `,
      [roleString, userId]
    );
  }

  async userName(id: string, name: string): Promise<void> {
    await this.client.query(
      `
          UPDATE users
          SET name = ?
          WHERE id = ?
      `,
      [name, id]
    );
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

  async updateRefreshToken(
    oldTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date
  ): Promise<void> {
    await this.client.query(
      `UPDATE refresh_tokens SET token_hash = ?, expires_at = ? WHERE token_hash = ?`,
      [newTokenHash, newExpiresAt, oldTokenHash]
    );
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.client.query(
      `
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?
    `,
      [tokenHash]
    );
  }

  async campaign(
    campaignId: string,
    data: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
    }
  ): Promise<void> {
    await this.client.query(
      `UPDATE campaigns SET name = ?, description = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?`,
      [data.name, data.description, data.startDate, data.endDate, campaignId]
    );
  }

  async campaignStatus(campaignId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE campaigns
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, campaignId]
    );
  }

  async campaignEndDate(campaignId: string, endDate: string): Promise<void> {
    await this.client.query(
      `
          UPDATE campaigns
          SET end_date = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [endDate, campaignId]
    );
  }

  async mission(
    missionId: string,
    data: {
      name: string;
      description: string;
      date: string;
      time: string;
      location: string;
      maxPersonnel?: number;
    }
  ): Promise<void> {
    await this.client.query(
      `UPDATE missions SET name = ?, description = ?, date = ?, time = ?, location = ?, max_personnel = ?, updated_at = NOW() WHERE id = ?`,
      [
        data.name,
        data.description,
        data.date,
        data.time,
        data.location,
        data.maxPersonnel || null,
        missionId,
      ]
    );
  }

  async missionStatus(missionId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE missions
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, missionId]
    );
  }

  async trainingStatus(trainingId: string, status: string): Promise<void> {
    await this.client.query(
      `
          UPDATE training_records
          SET status = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [status, trainingId]
    );
  }

  async trainingRecord(
    trainingId: string,
    data: {
      name: string;
      description: string;
      date: string;
      time: string;
      location: string;
      instructor?: string;
      maxPersonnel?: number;
    }
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
      ]
    );
  }

  async recurringTraining(
    id: string,
    data: UpdateRecurringTrainingData
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.dayOfWeek !== undefined) {
      updates.push("day_of_week = ?");
      values.push(data.dayOfWeek);
    }
    if (data.time !== undefined) {
      updates.push("time = ?");
      values.push(data.time);
    }
    if (data.location !== undefined) {
      updates.push("location = ?");
      values.push(data.location);
    }
    if (data.instructor !== undefined) {
      updates.push("instructor = ?");
      values.push(data.instructor || null);
    }
    if (data.maxPersonnel !== undefined) {
      updates.push("max_personnel = ?");
      values.push(data.maxPersonnel || null);
    }
    if (data.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    await this.client.query(
      `UPDATE recurring_trainings SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  async recurringTrainingInstanceCount(recurringId: string): Promise<void> {
    await this.client.query(
      `UPDATE recurring_trainings SET instances_created = instances_created + 1, updated_at = NOW() WHERE id = ?`,
      [recurringId]
    );
  }

  async updateFormDefinition(
    formId: number,
    title: string,
    description: string
  ): Promise<void> {
    await this.client.query(
      `UPDATE form_definitions 
       SET title = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, formId]
    );
  }

  async updateFormSubmissionStatus(
    submissionId: number,
    status: "pending" | "reviewed" | "approved" | "rejected",
    reviewedBy: string,
    notes?: string
  ): Promise<void> {
    await this.client.query(
      `UPDATE form_submissions
       SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ?
       WHERE id = ?`,
      [status, reviewedBy, notes, submissionId]
    );
  }

  async updateFormActiveStatus(
    formId: number,
    isActive: boolean
  ): Promise<void> {
    await this.client.query(
      `UPDATE form_definitions SET is_active = ? WHERE id = ?`,
      [isActive, formId]
    );
  }

  // ── Alerts ──

  async alertStatus(alertId: number, isActive: boolean): Promise<void> {
    await this.client.query(
      `UPDATE alerts SET is_active = ? WHERE id = ?`,
      [isActive, alertId]
    );
  }

  // ── SSE Items ──

  async sseItemStatus(sseItemId: number, status: string): Promise<void> {
    await this.client.query(
      `UPDATE sse_items SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, sseItemId]
    );
  }

  async sseItem(
    sseId: number,
    data: {
      name?: string;
      description?: string;
      type?: string;
      classification?: string | null;
      status?: string;
      collectedDate?: string | null;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.type !== undefined) {
      updates.push("type = ?");
      values.push(data.type);
    }
    if (data.classification !== undefined) {
      updates.push("classification = ?");
      values.push(data.classification || null);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.collectedDate !== undefined) {
      updates.push("collected_date = ?");
      values.push(data.collectedDate || null);
    }

    if (updates.length === 0) return;

    updates.push("updated_at = NOW()");
    values.push(sseId);

    await this.client.query(`UPDATE sse_items SET ${updates.join(", ")} WHERE id = ?`, values);
  }

  // ── Directives ──

  async directiveStatus(directiveId: number, status: string): Promise<void> {
    const completedAt = status === "done" ? "NOW()" : "NULL";
    await this.client.query(
      `UPDATE directives SET status = ?, completed_at = ${completedAt} WHERE id = ?`,
      [status, directiveId]
    );
  }

  // ── Campaign Operation Fields ──

  async campaignOperationFields(
    campaignId: string,
    data: {
      codename?: string;
      minimumRole?: string;
      ao?: string;
      brief?: string;
      commander?: string;
      forceComp?: string;
      missionType?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.codename !== undefined) {
      updates.push("codename = ?");
      values.push(data.codename || null);
    }
    if (data.minimumRole !== undefined) {
      updates.push("minimum_role = ?");
      values.push(data.minimumRole);
    }
    if (data.ao !== undefined) {
      updates.push("ao = ?");
      values.push(data.ao || null);
    }
    if (data.brief !== undefined) {
      updates.push("brief = ?");
      values.push(data.brief || null);
    }
    if (data.commander !== undefined) {
      updates.push("commander = ?");
      values.push(data.commander || null);
    }
    if (data.forceComp !== undefined) {
      updates.push("force_comp = ?");
      values.push(data.forceComp || null);
    }
    if (data.missionType !== undefined) {
      updates.push("mission_type = ?");
      values.push(data.missionType || null);
    }

    if (updates.length === 0) return;

    updates.push("updated_at = NOW()");
    values.push(campaignId);

    await this.client.query(
      `UPDATE campaigns SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  // ── Operation Documents ──

  async operationDocument(
    docId: number,
    data: {
      name?: string;
      description?: string;
      docType?: string | null;
      classification?: string | null;
      docDate?: string | null;
      minimumRole?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.docType !== undefined) {
      updates.push("doc_type = ?");
      values.push(data.docType || null);
    }
    if (data.classification !== undefined) {
      updates.push("classification = ?");
      values.push(data.classification || null);
    }
    if (data.docDate !== undefined) {
      updates.push("doc_date = ?");
      values.push(data.docDate || null);
    }
    if (data.minimumRole !== undefined) {
      updates.push("minimum_role = ?");
      values.push(data.minimumRole);
    }

    if (updates.length === 0) return;
    values.push(docId);

    await this.client.query(
      `UPDATE operation_documents SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  async document(
    documentId: number,
    data: {
      name?: string;
      description?: string;
      docType?: string | null;
      classification?: string;
      unit?: string;
      fileKey?: string;
      fileType?: string;
      fileSize?: number | null;
      minimumRole?: string;
      tags?: string[];
      allowedRoles?: string[];
      allowedUsers?: string[];
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.docType !== undefined) {
      updates.push("doc_type = ?");
      values.push(data.docType || null);
    }
    if (data.classification !== undefined) {
      updates.push("classification = ?");
      values.push(data.classification);
    }
    if (data.unit !== undefined) {
      updates.push("unit = ?");
      values.push(data.unit);
    }
    if (data.fileKey !== undefined) {
      updates.push("file_key = ?");
      values.push(data.fileKey);
    }
    if (data.fileType !== undefined) {
      updates.push("file_type = ?");
      values.push(data.fileType);
    }
    if (data.fileSize !== undefined) {
      updates.push("file_size = ?");
      values.push(data.fileSize ?? null);
    }
    if (data.minimumRole !== undefined) {
      updates.push("minimum_role = ?");
      values.push(data.minimumRole);
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      values.push(documentId);
      await this.client.query(`UPDATE documents SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    if (data.tags !== undefined || data.allowedRoles !== undefined || data.allowedUsers !== undefined) {
      await this.client.query(`DELETE FROM document_tags WHERE document_id = ?`, [documentId]);
      await this.client.query(`DELETE FROM document_allowed_roles WHERE document_id = ?`, [documentId]);
      await this.client.query(`DELETE FROM document_allowed_users WHERE document_id = ?`, [documentId]);

      for (const tag of data.tags || []) {
        const clean = tag.trim();
        if (!clean) continue;
        await this.client.query(`INSERT INTO document_tags (document_id, tag) VALUES (?, ?)`, [documentId, clean]);
      }
      for (const role of data.allowedRoles || []) {
        const clean = role.trim();
        if (!clean) continue;
        await this.client.query(`INSERT INTO document_allowed_roles (document_id, role) VALUES (?, ?)`, [
          documentId,
          clean,
        ]);
      }
      for (const userId of data.allowedUsers || []) {
        const clean = userId.trim();
        if (!clean) continue;
        await this.client.query(`INSERT INTO document_allowed_users (document_id, user_id) VALUES (?, ?)`, [
          documentId,
          clean,
        ]);
      }
    }
  }

  // ── Marketing gallery_media ──

  async galleryMedia(
    mediaId: number,
    data: {
      title?: string;
      description?: string | null;
      mediaType?: "image" | "video" | "youtube";
      src?: string;
      thumbnail?: string | null;
      videoId?: string | null;
      category?: string;
      units?: string[];
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.mediaType !== undefined) {
      updates.push("media_type = ?");
      values.push(data.mediaType);
    }
    if (data.src !== undefined) {
      updates.push("src = ?");
      values.push(data.src);
    }
    if (data.thumbnail !== undefined) {
      updates.push("thumbnail = ?");
      values.push(data.thumbnail || null);
    }
    if (data.videoId !== undefined) {
      updates.push("video_id = ?");
      values.push(data.videoId || null);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      values.push(data.category);
    }

    if (data.units !== undefined) {
      await this.client.query(`DELETE FROM gallery_media_units WHERE media_id = ?`, [mediaId]);
      for (const unit of data.units) {
        const u = String(unit).trim();
        if (!u) continue;
        await this.client.query(`INSERT INTO gallery_media_units (media_id, unit) VALUES (?, ?)`, [
          mediaId,
          u,
        ]);
      }
    }

    if (updates.length > 0) {
      values.push(mediaId);
      await this.client.query(`UPDATE gallery_media SET ${updates.join(", ")} WHERE id = ?`, values);
    }
  }

  async galleryMediaOrder(orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.client.query(`UPDATE gallery_media SET display_order = ? WHERE id = ?`, [i, orderedIds[i]]);
    }
  }

  // ── Operation Intel ──

  async operationIntel(
    intelId: number,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      minimumRole?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.imageUrl !== undefined) {
      updates.push("image_url = ?");
      values.push(data.imageUrl || null);
    }
    if (data.minimumRole !== undefined) {
      updates.push("minimum_role = ?");
      values.push(data.minimumRole);
    }

    if (updates.length === 0) return;
    values.push(intelId);

    await this.client.query(
      `UPDATE operation_intel SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  // ── After Action Reports ──

  async afterActionReportStatus(
    aarId: number,
    status: string,
    reviewedBy: string
  ): Promise<void> {
    await this.client.query(
      `UPDATE after_action_reports SET status = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [status, reviewedBy, aarId]
    );
  }
}

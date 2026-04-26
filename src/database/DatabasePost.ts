import type { DatabaseClient } from "./DatabaseClient";
import type { CreateRecurringTrainingData } from "@/types/recurring-training";
import type { FormQuestion } from "@/types/forms";
import { CustomTheme, UserRole } from "@/types/database";
import { GalleryItem } from "@/types/objectStorage";

export class DatabasePost {
  constructor(private client: DatabaseClient) {}

  async user(
    id: string,
    discord_username: string,
    email: string
  ): Promise<void> {
    await this.client.query(
      `
          INSERT IGNORE INTO users (id, discord_username, email)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
                               discord_username = VALUES(discord_username),
                               email = VALUES(email)
      `,
      [id, discord_username, email]
    );
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
      [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );
  }

  async galleryImage(
    s3Key: string,
    userId: string,
    galleryItem: GalleryItem
  ): Promise<void> {
    // First query remains the same
    const result = await this.client.query<any>(
      `INSERT INTO images (image_url, image_type, category, title, alt_text, description, unit, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s3Key,
        "Gallery",
        galleryItem.category,
        galleryItem.title,
        galleryItem.altText,
        galleryItem.description,
        galleryItem.unit,
        userId,
      ]
    );
    const imageId = result.insertId;

    if (!imageId) {
      throw new Error("Failed to insert new image record into the database.");
    }

    // Second query is now wrapped in the derived table trick
    await this.client.query(
      `
          INSERT INTO gallery_items (image_id, display_order)
          VALUES (?, (SELECT next_order FROM (SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM gallery_items) AS temp_table))
      `,
      [imageId]
    );
  }

  async userProfileImage(
    userId: string,
    imageUrl: string
  ): Promise<number | null> {
    const [existingUser] = await this.client.query<any>(
      `
      SELECT profile_image_id FROM users WHERE id = ?
    `,
      [userId]
    );
    if (existingUser && existingUser.profile_image_id) {
      return null;
    }
    const result = await this.client.query<any>(
      `
      INSERT INTO images (author_id, image_url, image_type)
      VALUES (?, ?, 'profile')
    `,
      [userId, imageUrl]
    );
    const imageId = result.insertId;
    await this.client.query(
      `
          UPDATE users SET profile_image_id = ? WHERE id = ?
      `,
      [imageId, userId]
    );
    return imageId;
  }

  async campaign(data: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    createdBy: string;
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO campaigns (id, name, description, start_date, end_date, status, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        data.id,
        data.name,
        data.description,
        data.startDate,
        data.endDate,
        data.status,
        data.createdBy,
      ]
    );
  }

  async mission(data: {
    id: string;
    campaignId: string;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    maxPersonnel?: number;
    status: string;
    createdBy: string;
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
      ]
    );
  }

  async missionRSVP(data: {
    id: string;
    missionId: string;
    userId: string;
    userName: string;
    status: string;
    notes?: string;
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
      [
        data.id,
        data.missionId,
        data.userId,
        data.userName,
        data.status,
        data.notes || null,
      ]
    );
  }

  async missionAttendance(data: {
    id: string;
    missionId: string;
    userId: string;
    userName: string;
    status: string;
    notes?: string;
    markedBy: string;
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
      [
        data.id,
        data.missionId,
        data.userId,
        data.userName,
        data.status,
        data.notes || null,
        data.markedBy,
      ]
    );
  }

  // Training methods
  async trainingRecord(data: {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    instructor?: string;
    maxPersonnel?: number;
    status: string;
    createdBy: string;
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
      ]
    );
  }

  async trainingRSVP(data: {
    id: string;
    trainingId: string;
    userId: string;
    userName: string;
    status: string;
    notes?: string;
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
      [
        data.id,
        data.trainingId,
        data.userId,
        data.userName,
        data.status,
        data.notes || null,
      ]
    );
  }

  async trainingAttendance(data: {
    id: string;
    trainingId: string;
    userId: string;
    userName: string;
    status: string;
    notes?: string;
    markedBy: string;
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
      [
        data.id,
        data.trainingId,
        data.userId,
        data.userName,
        data.status,
        data.notes || null,
        data.markedBy,
      ]
    );
  }

  // Recurring Training methods
  async recurringTraining(
    data: CreateRecurringTrainingData & { id: string; createdBy: string }
  ): Promise<void> {
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
      ]
    );
  }

  async recurringTrainingInstance(data: {
    id: string;
    recurringTrainingId: string;
    trainingId: string;
    scheduledDate: string;
  }): Promise<void> {
    await this.client.query(
      `
          INSERT INTO recurring_training_instances (id, recurring_training_id, training_id, scheduled_date)
          VALUES (?, ?, ?, ?)
      `,
      [data.id, data.recurringTrainingId, data.trainingId, data.scheduledDate]
    );
  }

  // Forms methods
  async createFormDefinition(
    title: string,
    description: string,
    createdBy: string
  ): Promise<number> {
    const formResult = await this.client.query<any>(
      `INSERT INTO form_definitions (title, description, created_by)
       VALUES (?, ?, ?)`,
      [title, description, createdBy]
    );
    return formResult.insertId;
  }

  async createFormQuestion(
    formId: number,
    question: Omit<FormQuestion, "id" | "form_id" | "created_at">
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
      ]
    );
  }

  async createFormSubmission(
    formId: number,
    userId?: string,
    userName?: string,
    userEmail?: string
  ): Promise<number> {
    const submissionResult = await this.client.query<any>(
      `INSERT INTO form_submissions (form_id, user_id, user_name, user_email)
       VALUES (?, ?, ?, ?)`,
      [formId, userId, userName, userEmail]
    );
    return submissionResult.insertId;
  }

  async createFormSubmissionAnswer(
    submissionId: number,
    questionId: number,
    answerText: string
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO form_submission_answers (submission_id, question_id, answer_text)
       VALUES (?, ?, ?)`,
      [submissionId, questionId, answerText]
    );
  }

  // Document methods
  async logDocumentAccess(
    documentPath: string,
    documentName: string,
    accessType: "view" | "download",
    userId?: string,
    userName?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO document_access_logs (document_path, document_name, user_id, user_name, access_type, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        documentPath,
        documentName,
        userId,
        userName,
        accessType,
        ipAddress,
        userAgent,
      ]
    );
  }

  async userCustomTheme(userId: string, theme: CustomTheme): Promise<void> {
    await this.client.query(
      `INSERT INTO user_custom_themes (user_id, name, accent_rgb, accent_darker_rgb)
       VALUES (?, ?, ?, ?)`,
      [userId, theme.name, theme.accent, theme.accentDarker]
    );
  }

  async defaultUserPreferences(userId: string): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO user_preferences (user_id, active_theme_name)
       VALUES (?, ?)`,
      [userId, "Red"]
    );
  }

  // ── Alerts ──

  async alert(data: {
    type: string;
    label: string;
    message: string;
    targetRoles?: string;
    expiresAt?: string;
    createdBy: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO alerts (type, label, message, target_roles, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.type,
        data.label,
        data.message,
        data.targetRoles || null,
        data.expiresAt || null,
        data.createdBy,
      ]
    );
    return result.insertId;
  }

  async perscomNotification(data: {
    targetPerscomId: number;
    event: string;
    type: string;
    label: string;
    message: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO perscom_notifications (target_perscom_id, event, type, label, message)
       VALUES (?, ?, ?, ?, ?)`,
      [data.targetPerscomId, data.event, data.type, data.label, data.message]
    );
    return result.insertId;
  }

  async perscomNotificationDismissal(
    notificationId: number,
    userId: string
  ): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO perscom_notification_dismissals (notification_id, user_id)
       VALUES (?, ?)`,
      [notificationId, userId]
    );
  }

  // ── SSE Items ──

  async sseItem(data: {
    campaignId: string;
    missionId?: string | null;
    type: string;
    name: string;
    description: string;
    status?: string;
    minimumRole?: string;
    imageUrl?: string;
    classification?: string | null;
    collectedDate?: string | null;
    uploadedBy: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO sse_items (campaign_id, mission_id, type, name, description, status, minimum_role, image_url, classification, collected_date, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.campaignId,
        data.missionId ?? null,
        data.type,
        data.name,
        data.description,
        data.status || "LOGGED",
        data.minimumRole || UserRole.member,
        data.imageUrl || null,
        data.classification ?? null,
        data.collectedDate ?? null,
        data.uploadedBy,
      ]
    );
    return result.insertId;
  }

  async attachSseToMission(sseId: number, missionId: string): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO sse_item_missions (sse_id, mission_id) VALUES (?, ?)`,
      [sseId, missionId]
    );
  }

  // ── Directives ──

  async directive(data: {
    label: string;
    description?: string;
    userId: string;
    assignedBy: string;
    dueDate?: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO directives (label, description, user_id, assigned_by, due_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.label,
        data.description || null,
        data.userId,
        data.assignedBy,
        data.dueDate || null,
      ]
    );
    return result.insertId;
  }

  async bulkDirectives(
    data: {
      label: string;
      description?: string;
      assignedBy: string;
      dueDate?: string;
    },
    userIds: string[]
  ): Promise<void> {
    const values = userIds.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const params: any[] = [];
    for (const userId of userIds) {
      params.push(
        data.label,
        data.description || null,
        userId,
        data.assignedBy,
        data.dueDate || null
      );
    }
    await this.client.query(
      `INSERT INTO directives (label, description, user_id, assigned_by, due_date) VALUES ${values}`,
      params
    );
  }

  // ── Operation Documents ──

  async operationDocument(data: {
    campaignId: string;
    missionId?: string;
    name: string;
    description?: string;
    docType?: string | null;
    classification?: string | null;
    docDate?: string | null;
    fileUrl: string;
    fileType: string;
    fileSize?: string;
    minimumRole?: string;
    uploadedBy: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO operation_documents (campaign_id, mission_id, name, description, doc_type, classification, doc_date, file_url, file_type, file_size, minimum_role, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.campaignId,
        data.missionId || null,
        data.name,
        data.description || null,
        data.docType ?? null,
        data.classification ?? null,
        data.docDate ?? null,
        data.fileUrl,
        data.fileType,
        data.fileSize || null,
        data.minimumRole || "member",
        data.uploadedBy,
      ]
    );
    return result.insertId;
  }

  async attachDocumentToMission(
    docId: number,
    missionId: string
  ): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO operation_document_missions (document_id, mission_id) VALUES (?, ?)`,
      [docId, missionId]
    );
  }

  async document(data: {
    name: string;
    description?: string;
    docType?: string | null;
    classification?: string;
    unit?: string;
    fileKey: string;
    fileType: string;
    fileSize?: number | null;
    minimumRole?: string;
    uploadedBy: string;
    tags?: string[];
    allowedRoles?: string[];
    allowedUsers?: string[];
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO documents (name, description, doc_type, classification, unit, file_key, file_type, file_size, minimum_role, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.docType ?? null,
        data.classification || "GENERAL",
        data.unit || "NSWG1 HQ",
        data.fileKey,
        data.fileType,
        data.fileSize ?? null,
        data.minimumRole || UserRole.member,
        data.uploadedBy,
      ]
    );
    const id = result.insertId as number;
    await this.replaceDocumentScopes(
      id,
      data.tags || [],
      data.allowedRoles || [],
      data.allowedUsers || []
    );
    return id;
  }

  async replaceDocumentScopes(
    documentId: number,
    tags: string[],
    allowedRoles: string[],
    allowedUsers: string[]
  ): Promise<void> {
    await this.client.query(`DELETE FROM document_tags WHERE document_id = ?`, [
      documentId,
    ]);
    await this.client.query(
      `DELETE FROM document_allowed_roles WHERE document_id = ?`,
      [documentId]
    );
    await this.client.query(
      `DELETE FROM document_allowed_users WHERE document_id = ?`,
      [documentId]
    );

    for (const tag of tags) {
      const clean = tag.trim();
      if (!clean) continue;
      await this.client.query(
        `INSERT INTO document_tags (document_id, tag) VALUES (?, ?)`,
        [documentId, clean]
      );
    }
    for (const role of allowedRoles) {
      const clean = role.trim();
      if (!clean) continue;
      await this.client.query(
        `INSERT INTO document_allowed_roles (document_id, role) VALUES (?, ?)`,
        [documentId, clean]
      );
    }
    for (const userId of allowedUsers) {
      const clean = userId.trim();
      if (!clean) continue;
      await this.client.query(
        `INSERT INTO document_allowed_users (document_id, user_id) VALUES (?, ?)`,
        [documentId, clean]
      );
    }
  }

  async attachDocumentToTraining(
    trainingId: string,
    documentId: number
  ): Promise<void> {
    await this.client.query(
      `INSERT IGNORE INTO training_documents (training_id, document_id) VALUES (?, ?)`,
      [trainingId, documentId]
    );
  }

  async replaceTrainingAllowlist(
    trainingId: string,
    roles: string[],
    userIds: string[]
  ): Promise<void> {
    await this.client.query(
      `DELETE FROM training_allowed_roles WHERE training_id = ?`,
      [trainingId]
    );
    await this.client.query(
      `DELETE FROM training_allowed_users WHERE training_id = ?`,
      [trainingId]
    );

    for (const role of roles) {
      const clean = role.trim();
      if (!clean) continue;
      await this.client.query(
        `INSERT INTO training_allowed_roles (training_id, role) VALUES (?, ?)`,
        [trainingId, clean]
      );
    }

    for (const userId of userIds) {
      const clean = userId.trim();
      if (!clean) continue;
      await this.client.query(
        `INSERT INTO training_allowed_users (training_id, user_id) VALUES (?, ?)`,
        [trainingId, clean]
      );
    }
  }

  // ── Operation Intel ──

  async operationIntel(data: {
    campaignId: string;
    missionId?: string | null;
    type: string;
    title: string;
    description?: string;
    imageUrl?: string;
    minimumRole?: string;
    createdBy: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO operation_intel (campaign_id, mission_id, type, title, description, image_url, minimum_role, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.campaignId,
        data.missionId ?? null,
        data.type,
        data.title,
        data.description || null,
        data.imageUrl || null,
        data.minimumRole || "member",
        data.createdBy,
      ]
    );
    return result.insertId;
  }

  /** Upsert regional + operational narrative text for a campaign or mission (IntelBlockForm). */
  async operationIntelUpsertBlock(data: {
    ownerType: "campaign" | "mission";
    ownerId: string;
    regionalIntel: string;
    operationalIntel: string;
    createdBy: string;
  }): Promise<void> {
    let campaignId: string;
    let missionId: string | null;

    if (data.ownerType === "campaign") {
      campaignId = data.ownerId;
      missionId = null;
    } else {
      missionId = data.ownerId;
      const rows = await this.client.query<{ campaign_id: string }[]>(
        `SELECT campaign_id FROM missions WHERE id = ?`,
        [missionId]
      );
      if (rows.length === 0) {
        throw new Error("Mission not found");
      }
      campaignId = rows[0].campaign_id;
    }

    await this.upsertIntelNarrativeRow(
      campaignId,
      missionId,
      "regional",
      "Regional Intel",
      data.regionalIntel,
      data.createdBy
    );
    await this.upsertIntelNarrativeRow(
      campaignId,
      missionId,
      "operational",
      "Operational Intel",
      data.operationalIntel,
      data.createdBy
    );
  }

  private async upsertIntelNarrativeRow(
    campaignId: string,
    missionId: string | null,
    intelType: "regional" | "operational",
    title: string,
    description: string,
    createdBy: string
  ): Promise<void> {
    const rows = await this.client.query<{ id: number }[]>(
      `SELECT id FROM operation_intel WHERE campaign_id = ? AND mission_id <=> ? AND type = ?`,
      [campaignId, missionId, intelType]
    );

    if (rows.length > 0) {
      await this.client.query(
        `UPDATE operation_intel SET description = ?, created_by = ?, updated_at = NOW() WHERE id = ?`,
        [description || null, createdBy, rows[0].id]
      );
    } else {
      await this.client.query(
        `INSERT INTO operation_intel (campaign_id, mission_id, type, title, description, image_url, minimum_role, created_by)
         VALUES (?, ?, ?, ?, ?, NULL, 'member', ?)`,
        [
          campaignId,
          missionId,
          intelType,
          title,
          description || null,
          createdBy,
        ]
      );
    }
  }

  async galleryMedia(data: {
    title: string;
    description?: string;
    mediaType: "image" | "video" | "youtube";
    src: string;
    thumbnail?: string | null;
    videoId?: string | null;
    category: string;
    units: string[];
    createdBy: string | null;
  }): Promise<number> {
    const orderRows = await this.client.query<{ next: number }[]>(
      `SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM gallery_media`
    );
    const nextOrder = orderRows[0]?.next ?? 1;

    const result = await this.client.query<any>(
      `INSERT INTO gallery_media (title, description, media_type, src, thumbnail, video_id, category, display_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description || null,
        data.mediaType,
        data.src,
        data.thumbnail ?? null,
        data.videoId ?? null,
        data.category,
        nextOrder,
        data.createdBy,
      ]
    );
    const id = result.insertId as number;
    for (const unit of data.units) {
      const u = String(unit).trim();
      if (!u) continue;
      await this.client.query(
        `INSERT INTO gallery_media_units (media_id, unit) VALUES (?, ?)`,
        [id, u]
      );
    }
    return id;
  }

  // ── After Action Reports ──

  async afterActionReport(data: {
    campaignId: string;
    missionId?: string;
    title: string;
    summary: string;
    keyOutcomes?: string;
    lessonsLearned?: string;
    submittedBy: string;
    status?: string;
  }): Promise<number> {
    const result = await this.client.query<any>(
      `INSERT INTO after_action_reports (campaign_id, mission_id, title, summary, key_outcomes, lessons_learned, submitted_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.campaignId,
        data.missionId || null,
        data.title,
        data.summary,
        data.keyOutcomes || null,
        data.lessonsLearned || null,
        data.submittedBy,
        data.status || "submitted",
      ]
    );
    return result.insertId;
  }
}

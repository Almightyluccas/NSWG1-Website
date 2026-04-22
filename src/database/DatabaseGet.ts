import type {
  RefreshTokenRow,
  User,
  UserFullInfo,
} from "@/types/database";
import type { DatabaseClient } from "./DatabaseClient";
import type {
  RecurringTraining,
  RecurringTrainingWithStats,
} from "@/types/recurring-training";
import type {
  DocumentAccessLog,
  FormDefinition,
  FormQuestion,
  FormSubmission,
  FormSubmissionAnswer,
  RawSubmissionQueryResult,
} from "@/types/forms";
import { GalleryItem } from "@/types/objectStorage";
import type { MarketingGalleryItem } from "@/app/(marketing)/gallery/gallery-types";

export class DatabaseGet {
  constructor(private client: DatabaseClient) {}

  async users(): Promise<User[]> {
    const rows = await this.client.query<any[]>(`
        SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
               u.email, u.created_at, u.role, i.image_url
        FROM users u
                 LEFT JOIN images i ON u.profile_image_id = i.id
    `);

    return rows.map((row) => ({
      id: row.id,
      perscom_id: row.perscom_id,
      steam_id: row.steam_id,
      discord_username: row.discord_username,
      name: row.name,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      email: row.email,
      created_at: new Date(row.created_at),
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
      imageUrl: row.image_url || null,
    }));
  }

  async usersForSelection(): Promise<
    Array<{
      id: string;
      name: string;
      discord_username: string;
      role: string[];
    }>
  > {
    const rows = await this.client.query<any[]>(`
        SELECT id, name, discord_username, role
        FROM users
        WHERE name IS NOT NULL AND name != ''
          AND role LIKE '%member%'
        ORDER BY name ASC
    `);

    return rows.map((row) => ({
      id: row.id,
      name: row.name || row.discord_username,
      discord_username: row.discord_username,
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
    }));
  }

  async recentUsers(limit: number): Promise<User[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
                 u.email, u.created_at, u.role, i.image_url
          FROM users u
                   LEFT JOIN images i ON u.profile_image_id = i.id
          ORDER BY u.created_at DESC
          LIMIT ?
      `,
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      perscom_id: row.perscom_id,
      steam_id: row.steam_id,
      discord_username: row.discord_username,
      name: row.name,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      email: row.email,
      created_at: new Date(row.created_at),
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
      imageUrl: row.image_url || null,
    }));
  }

  async discordIdByPerscomId(perscomId: number): Promise<string | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT id FROM users WHERE perscom_id = ?
      `,
      [perscomId]
    );

    if (rows.length === 0) return null;

    return rows[0].id || null;
  }

  async userInfo(userId: string): Promise<UserFullInfo> {
    const rows = await this.client.query<any[]>(
      `
          SELECT
              u.role,
              u.perscom_id,
              u.name,
              u.discord_username,
              up.active_theme_name,
              uct.name AS custom_theme_name,
              uct.accent_rgb,
              uct.accent_darker_rgb,
              i.image_url
          FROM
              users u
                  LEFT JOIN
              user_preferences up ON u.id = up.user_id
                  LEFT JOIN
              user_custom_themes uct ON u.id = uct.user_id
                  LEFT JOIN images i ON u.profile_image_id = i.id
          WHERE
              u.id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return {
        roles: [],
        perscomId: null,
        name: null,
        preferences: { activeThemeName: null },
        customThemes: [],
        imageUrl: null,
        discordName: null,
      };
    }

    const firstRow = rows[0];
    const result: UserFullInfo = {
      roles: firstRow.role
        ? firstRow.role.split(",").map((r: string) => r.trim())
        : [],
      perscomId: firstRow.perscom_id,
      name: firstRow.name,
      discordName: firstRow.discord_username,
      preferences: {
        activeThemeName: firstRow.active_theme_name,
      },
      customThemes: [],
      imageUrl: firstRow.image_url || null,
    };

    for (const row of rows) {
      if (row.custom_theme_name) {
        result.customThemes.push({
          name: row.custom_theme_name,
          accent: row.accent_rgb,
          accentDarker: row.accent_darker_rgb,
        });
      }
    }

    return result;
  }

  async userCount(): Promise<{
    currentCount: number;
    percentChange: number;
    isPositive: boolean;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentResult = await this.client.query<any[]>(
      `
          SELECT COUNT(*) as count
          FROM users
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `,
      [currentMonth, currentYear]
    );

    const previousResult = await this.client.query<any[]>(
      `
          SELECT COUNT(*) as count
          FROM users
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `,
      [previousMonth, previousYear]
    );

    const currentCount = currentResult[0].count;
    const previousCount = previousResult[0].count;

    let percentChange = 0;
    if (previousCount > 0) {
      percentChange = ((currentCount - previousCount) / previousCount) * 100;
    } else if (currentCount > 0) {
      percentChange = 100;
    }

    return {
      currentCount,
      percentChange: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0,
    };
  }

  async userProfilePictureByPerscomId(
    perscomId: number
  ): Promise<string | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT i.image_url FROM users u LEFT JOIN images i ON i.id = u.profile_image_id WHERE u.perscom_id = ?
      `,
      [perscomId]
    );

    return rows.length > 0 ? rows[0].image_url : null;
  }

  async refreshTokenByDetails(
    userId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const rows = await this.client.query<RefreshTokenRow[]>(
      `
      SELECT token_hash FROM refresh_tokens
      WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW() AND ip_address = ? AND user_agent = ?
    `,
      [userId, ipAddress, userAgent]
    );
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows[0] || null;
  }

  async getRefreshTokenByHash(
    tokenHash: string
  ): Promise<RefreshTokenRow | null> {
    const rows = await this.client.query<RefreshTokenRow[]>(
      `
      SELECT user_id, expires_at, user_agent FROM refresh_tokens
      WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
    `,
      [tokenHash]
    );
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows[0] || null;
  }

  // Campaign methods
  async campaigns(userId?: string, isAdmin = false): Promise<any[]> {
    if (isAdmin) {
      return await this.client.query<any[]>(`
          SELECT c.*, DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date, DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
                 COUNT(DISTINCT m.id) as mission_count
          FROM campaigns c
                   LEFT JOIN missions m ON c.id = m.campaign_id
          GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, c.status, c.created_by, c.created_at, c.updated_at
          ORDER BY c.created_at DESC
      `);
    }

    // For regular users, return all campaigns (they can see all but only RSVP to missions)
    return await this.client.query<any[]>(`
        SELECT c.*, DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date, DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
               COUNT(DISTINCT m.id) as mission_count
        FROM campaigns c
                 LEFT JOIN missions m ON c.id = m.campaign_id
        GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, c.status, c.created_by, c.created_at, c.updated_at
        ORDER BY c.created_at DESC
    `);
  }

  async campaignById(campaignId: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT * FROM campaigns WHERE id = ?
      `,
      [campaignId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async missionsByCampaign(campaignId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date FROM missions
          WHERE campaign_id = ?
          ORDER BY date ASC, time ASC
      `,
      [campaignId]
    );
  }

  async missionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT m.*, c.name as campaign_name, DATE_FORMAT(m.date, '%Y-%m-%d') as date
          FROM missions m
                   LEFT JOIN campaigns c ON m.campaign_id = c.id
          WHERE m.date BETWEEN ? AND ?
          ORDER BY m.date ASC, m.time ASC
      `,
      [startDate, endDate]
    );
  }

  async missionRSVPs(missionId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT mr.*, u.name as user_name
          FROM mission_rsvps mr
                   JOIN users u ON mr.user_id = u.id
          WHERE mr.mission_id = ?
          ORDER BY mr.created_at ASC
      `,
      [missionId]
    );
  }

  async missionAttendance(missionId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT ma.*, u.name as user_name, marker.name as marked_by_name
          FROM mission_attendance ma
                   JOIN users u ON ma.user_id = u.id
                   JOIN users marker ON ma.marked_by = marker.id
          WHERE ma.mission_id = ?
          ORDER BY ma.marked_at ASC
      `,
      [missionId]
    );
  }

  // Training methods
  async trainingRecords(userId?: string, isAdmin = false): Promise<any[]> {
    if (isAdmin) {
      const rows = await this.client.query<any[]>(`
          SELECT t.*, DATE_FORMAT(t.date, '%Y-%m-%d') as date,
                 COUNT(DISTINCT tr.id) as rsvp_count
          FROM training_records t
                   LEFT JOIN training_rsvps tr ON t.id = tr.training_id
          GROUP BY t.id, t.name, t.description, t.date, t.time, t.location, t.instructor, t.max_personnel, t.status, t.created_by, t.created_at, t.updated_at
          ORDER BY t.date DESC, t.time DESC
      `);
      return rows;
    }

    // For regular users, return all training records (they can see all but only RSVP)
    const rows = await this.client.query<any[]>(`
        SELECT t.*, DATE_FORMAT(t.date, '%Y-%m-%d') as date,
               COUNT(DISTINCT tr.id) as rsvp_count
        FROM training_records t
                 LEFT JOIN training_rsvps tr ON t.id = tr.training_id
        GROUP BY t.id, t.name, t.description, t.date, t.time, t.location, t.instructor, t.max_personnel, t.status, t.created_by, t.created_at, t.updated_at
        ORDER BY t.date DESC, t.time DESC
    `);
    if (!userId) return rows;

    const roles = await this.trainingAllowedRolesByUser(userId);
    return rows.filter((row) => {
      const roleSet = new Set(roles);
      return roleSet.has(`training:${row.id}:open`) || roleSet.has(`training:${row.id}:allowed`);
    });
  }

  async trainingByDateRange(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date FROM training_records
          WHERE date BETWEEN ? AND ?
          ORDER BY date ASC, time ASC
      `,
      [startDate, endDate]
    );
    return rows;
  }

  async trainingRSVPs(trainingId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT tr.*, u.name as user_name
          FROM training_rsvps tr
                   JOIN users u ON tr.user_id = u.id
          WHERE tr.training_id = ?
          ORDER BY tr.created_at ASC
      `,
      [trainingId]
    );
    return rows;
  }

  async userTrainingRsvpStatus(trainingId: string, userId: string): Promise<string | null> {
    const rows = await this.client.query<{ status: string }[]>(
      `SELECT status FROM training_rsvps WHERE training_id = ? AND user_id = ? LIMIT 1`,
      [trainingId, userId]
    );
    return rows[0]?.status ?? null;
  }

  async trainingAllowlist(trainingId: string): Promise<{ roles: string[]; userIds: string[] }> {
    const roleRows = await this.client.query<{ role: string }[]>(
      `SELECT role FROM training_allowed_roles WHERE training_id = ?`,
      [trainingId]
    );
    const userRows = await this.client.query<{ user_id: string }[]>(
      `SELECT user_id FROM training_allowed_users WHERE training_id = ?`,
      [trainingId]
    );
    return {
      roles: roleRows.map((row) => row.role),
      userIds: userRows.map((row) => row.user_id),
    };
  }

  async canUserAccessTraining(trainingId: string, userId: string, userRoles: string[]): Promise<boolean> {
    const allowlist = await this.trainingAllowlist(trainingId);
    if (allowlist.roles.length === 0 && allowlist.userIds.length === 0) {
      return true;
    }
    if (allowlist.userIds.includes(userId)) return true;
    return allowlist.roles.some((role) => userRoles.includes(role));
  }

  private async trainingAllowedRolesByUser(userId: string): Promise<string[]> {
    const openRows = await this.client.query<{ id: string }[]>(
      `SELECT tr.id
       FROM training_records tr
       LEFT JOIN training_allowed_roles tar ON tr.id = tar.training_id
       LEFT JOIN training_allowed_users tau ON tr.id = tau.training_id
       GROUP BY tr.id
       HAVING COUNT(tar.role) = 0 AND COUNT(tau.user_id) = 0`
    );
    const directRows = await this.client.query<{ training_id: string }[]>(
      `SELECT training_id FROM training_allowed_users WHERE user_id = ?`,
      [userId]
    );
    const roleRows = await this.client.query<{ training_id: string }[]>(
      `SELECT DISTINCT tar.training_id
       FROM training_allowed_roles tar
       JOIN users u ON u.id = ?
       WHERE FIND_IN_SET(tar.role, u.role) > 0`,
      [userId]
    );
    return [
      ...openRows.map((row) => `training:${row.id}:open`),
      ...directRows.map((row) => `training:${row.training_id}:allowed`),
      ...roleRows.map((row) => `training:${row.training_id}:allowed`),
    ];
  }

  async trainingAttendance(trainingId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT ta.*, u.name as user_name, marker.name as marked_by_name
          FROM training_attendance ta
                   JOIN users u ON ta.user_id = u.id
                   JOIN users marker ON ta.marked_by = marker.id
          WHERE ta.training_id = ?
          ORDER BY ta.marked_at ASC
      `,
      [trainingId]
    );
    return rows;
  }

  // Attendance methods
  async attendanceRecords(userId: string): Promise<any[]> {
    const missionAttendance = await this.client.query<any[]>(
      `
          SELECT ma.*, m.name as event_name, DATE_FORMAT(m.date, '%Y-%m-%d') as date, 'mission' as event_type
          FROM mission_attendance ma
                   JOIN missions m ON ma.mission_id = m.id
          WHERE ma.user_id = ?
      `,
      [userId]
    );

    const trainingAttendance = await this.client.query<any[]>(
      `
          SELECT ta.*, t.name as event_name, DATE_FORMAT(t.date, '%Y-%m-%d') as date, 'training' as event_type
          FROM training_attendance ta
                   JOIN training_records t ON ta.training_id = t.id
          WHERE ta.user_id = ?
      `,
      [userId]
    );

    return [...missionAttendance, ...trainingAttendance].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Recurring Training methods
  async recurringTrainings(): Promise<RecurringTrainingWithStats[]> {
    const rows = await this.client.query<any[]>(`
        SELECT rt.*,
               COUNT(rti.id) as instances_created,
               u.name as created_by_name
        FROM recurring_trainings rt
                 LEFT JOIN recurring_training_instances rti ON rt.id = rti.recurring_training_id
                 LEFT JOIN users u ON rt.created_by = u.id
        GROUP BY rt.id
        ORDER BY rt.day_of_week ASC, rt.time ASC
    `);

    const DAY_NAMES = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return rows.map((row) => ({
      ...row,
      instances_created: row.instances_created || 0,
      created_by_name: row.created_by_name || "Unknown",
      dayName: DAY_NAMES[row.day_of_week] || "Unknown",
    }));
  }

  async recurringTrainingById(id: string): Promise<RecurringTraining | null> {
    const rows = await this.client.query<any[]>(
      `SELECT * FROM recurring_trainings WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as RecurringTraining) : null;
  }

  async activeRecurringTrainings(): Promise<RecurringTraining[]> {
    const rows = await this.client.query<any[]>(
      `SELECT * FROM recurring_trainings WHERE is_active = TRUE`
    );
    return rows as RecurringTraining[];
  }

  async recurringTrainingInstances(recurringId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT rti.*, tr.name, tr.date, tr.time, tr.status
          FROM recurring_training_instances rti
                   JOIN training_records tr ON rti.training_id = tr.id
          WHERE rti.recurring_training_id = ?
          ORDER BY tr.date DESC
      `,
      [recurringId]
    );
    return rows;
  }

  async recurringTrainingInstanceExists(
    recurringId: string,
    scheduledDate: string
  ): Promise<boolean> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM recurring_training_instances WHERE recurring_training_id = ? AND scheduled_date = ?`,
      [recurringId, scheduledDate]
    );
    return rows.length > 0;
  }

  async missionConflictsOnDate(date: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM missions WHERE date = ? AND status IN ('scheduled', 'in-progress')`,
      [date]
    );
    return rows;
  }

  async trainingRecordByDetails(
    name: string,
    date: string,
    time: string
  ): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM training_records WHERE name = ? AND date = ? AND time = ? ORDER BY created_at DESC LIMIT 1`,
      [name, date, time]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Forms methods
  async getForms(): Promise<FormDefinition[]> {
    const forms = await this.client.query<FormDefinition[]>(
      `SELECT * FROM form_definitions WHERE is_active = true ORDER BY created_at DESC`
    );
    return forms;
  }

  async getFormWithQuestions(formId: number): Promise<FormDefinition | null> {
    const [form] = await this.client.query<FormDefinition[]>(
      `SELECT * FROM form_definitions WHERE id = ?`,
      [formId]
    );

    if (!form) return null;

    const questions = await this.client.query<FormQuestion[]>(
      `SELECT * FROM form_questions WHERE form_id = ? ORDER BY order_index ASC`,
      [formId]
    );

    const parsedQuestions = questions.map((q) => {
      let options: string[] | undefined = undefined;

      if (q.options !== null && typeof q.options !== "undefined") {
        const optionsValue = q.options;

        if (Array.isArray(optionsValue)) {
          options = optionsValue
            .map((opt) => String(opt).trim())
            .filter((opt) => opt.length > 0);
        } else {
          const optionsStr = String(optionsValue);

          try {
            const parsedJson = JSON.parse(optionsStr);
            if (Array.isArray(parsedJson)) {
              options = parsedJson
                .map((opt) => String(opt).trim())
                .filter((opt) => opt.length > 0);
            } else if (
              typeof parsedJson === "string" &&
              parsedJson.includes(",")
            ) {
              options = parsedJson
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt.length > 0);
            } else if (
              typeof parsedJson === "string" &&
              parsedJson.length > 0
            ) {
              options = [parsedJson.trim()];
            }
          } catch {
            if (optionsStr.includes(",")) {
              options = optionsStr
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt.length > 0);
            } else if (optionsStr.length > 0) {
              options = [optionsStr.trim()];
            }
          }
        }
      }

      return {
        ...q,
        options,
      };
    });

    return { ...form, questions: parsedQuestions };
  }

  async getFormSubmissions(formId: number): Promise<FormSubmission[]> {
    const submissions = await this.client.query<FormSubmission[]>(
      `SELECT * FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC`,
      [formId]
    );

    for (const submission of submissions) {
      const answers = await this.client.query<FormSubmissionAnswer[]>(
        `SELECT fsa.*, fq.question_text, fq.question_type
         FROM form_submission_answers fsa
                  JOIN form_questions fq ON fsa.question_id = fq.id
         WHERE fsa.submission_id = ?
         ORDER BY fq.order_index ASC`,
        [submission.id]
      );

      submission.answers = answers.map((a) => ({
        ...a,
        answer_json: a.answer_json
          ? JSON.parse(a.answer_json as string)
          : undefined,
      }));
    }

    return submissions;
  }

  async getDocumentAccessLogs(limit = 100): Promise<DocumentAccessLog[]> {
    const logs = await this.client.query<DocumentAccessLog[]>(
      `SELECT * FROM document_access_logs 
       ORDER BY accessed_at DESC 
       LIMIT ?`,
      [limit]
    );

    return logs;
  }

  async getUserFormSubmissions(userId: string): Promise<FormSubmission[]> {
    const submissionsData = await this.client.query<RawSubmissionQueryResult[]>(
      `
          SELECT
              fs.id AS submission_id,
              fs.form_id,
              fs.user_id,
              fs.user_name,
              fs.user_email,
              fs.submitted_at,
              fs.status,
              fs.reviewed_by,
              fs.reviewed_at,
              fs.notes,
              fd.title AS form_title,
              fd.description AS form_description,
              fq.id AS question_id,
              fq.question_text,
              fq.question_type,
              fq.is_required,
              fq.options,
              fq.order_index,
              fsa.id AS answer_id,
              fsa.answer_text,
              fsa.answer_json
          FROM
              form_submissions fs
                  JOIN
              form_definitions fd ON fs.form_id = fd.id
                  LEFT JOIN
              users u ON fs.user_id = u.id
                  LEFT JOIN
              form_submission_answers fsa ON fs.id = fsa.submission_id
                  LEFT JOIN
              form_questions fq ON fsa.question_id = fq.id
          WHERE
              fs.user_id = ?
          ORDER BY
              fs.submitted_at DESC, fq.order_index ASC
      `,
      [userId]
    );

    const submissionsMap = new Map<number, FormSubmission>();

    for (const row of submissionsData) {
      let submission = submissionsMap.get(row.submission_id);

      if (!submission) {
        submission = {
          id: row.submission_id,
          form_id: row.form_id,
          user_id: row.user_id ?? undefined,
          user_name: row.user_name ?? undefined,
          user_email: row.user_email ?? undefined,
          submitted_at: new Date(row.submitted_at),
          status: row.status,
          reviewed_by: row.reviewed_by ?? undefined,
          reviewed_at: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
          notes: row.notes ?? undefined,
          form_title: row.form_title,
          form_description: row.form_description ?? undefined,
          answers: [],
        };
        submissionsMap.set(row.submission_id, submission);
      }

      if (row.question_id !== null) {
        let parsedOptions: string[] | undefined;
        if (row.options !== null && typeof row.options !== "undefined") {
          if (typeof row.options === "string") {
            try {
              let optionsString = row.options.trim();
              if (
                optionsString.startsWith("[") &&
                optionsString.endsWith("]") &&
                optionsString.includes("'")
              ) {
                optionsString = optionsString.replace(/'/g, '"');
              }
              parsedOptions = JSON.parse(optionsString);
            } catch (e) {
              console.error(
                `Error parsing options for question ID ${row.question_id} (string format):`,
                row.options,
                e
              );
              parsedOptions = undefined;
            }
          } else if (Array.isArray(row.options)) {
            parsedOptions = row.options as string[];
          } else {
            console.warn(
              `Unexpected type for options for question ID ${row.question_id}:`,
              typeof row.options,
              row.options
            );
            parsedOptions = undefined;
          }
        }

        let parsedAnswerJson: any | undefined;
        try {
          if (row.answer_json) {
            parsedAnswerJson = JSON.parse(row.answer_json);
          }
        } catch (e) {
          console.error(
            `Error parsing answer_json for answer ID ${row.answer_id}:`,
            row.answer_json,
            e
          );
          parsedAnswerJson = undefined;
        }

        const answer: FormSubmissionAnswer = {
          id: row.answer_id!,
          submission_id: row.submission_id,
          question_id: row.question_id,
          answer_text: row.answer_text ?? undefined,
          answer_json: parsedAnswerJson,
          created_at: new Date().toISOString(),
          question: {
            id: row.question_id,
            form_id: row.form_id,
            question_text: row.question_text!,
            question_type: row.question_type!,
            is_required: row.is_required!,
            options: parsedOptions,
            order_index: row.order_index!,
            created_at: new Date().toISOString(),
          },
          question_text: row.question_text!,
          question_type: row.question_type!,
        };
        submission.answers!.push(answer);
      }
    }

    return Array.from(submissionsMap.values());
  }

  async galleryItems(): Promise<GalleryItem[]> {
    return await this.client.query<GalleryItem[]>(
      `SELECT i.title, i.alt_text AS altText, i.description, '' AS category, i.unit, gi.display_order
       FROM images AS i
                JOIN gallery_items AS gi ON i.id = gi.image_id`
    );
  }

  /** Public marketing gallery rows (images / video / YouTube). */
  async galleryMarketingItems(): Promise<MarketingGalleryItem[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT gm.id,
                 gm.title,
                 gm.description,
                 gm.media_type,
                 gm.src,
                 gm.thumbnail,
                 gm.video_id,
                 gm.category,
                 gm.display_order,
                 GROUP_CONCAT(gmu.unit ORDER BY gmu.unit SEPARATOR ',') AS units_csv
          FROM gallery_media gm
                   LEFT JOIN gallery_media_units gmu ON gm.id = gmu.media_id
          GROUP BY gm.id, gm.title, gm.description, gm.media_type, gm.src, gm.thumbnail, gm.video_id, gm.category,
                   gm.display_order
          ORDER BY gm.display_order ASC, gm.id ASC
      `
    );

    return rows.map((row) => {
      const units = row.units_csv
        ? String(row.units_csv)
            .split(",")
            .map((u: string) => u.trim())
            .filter(Boolean)
        : [];
      const type = row.media_type as MarketingGalleryItem["type"];
      const item: MarketingGalleryItem = {
        id: row.id,
        title: row.title,
        category: row.category,
        unit: units.length ? units : ["tacdevron2"],
        type,
        src: row.src,
        description: row.description || "",
        thumbnail: row.thumbnail || undefined,
        videoId: row.video_id || undefined,
        videoType: type === "youtube" ? "youtube" : type === "video" ? "local" : undefined,
      };
      return item;
    });
  }

  // ── Alerts ──

  async alerts(targetRoles?: string[]): Promise<any[]> {
    let query = `
      SELECT a.*, u.name as creator_name
      FROM alerts a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.is_active = TRUE
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    `;
    const params: any[] = [];

    if (targetRoles && targetRoles.length > 0) {
      // Return alerts that target any of the user's roles, or alerts with no target (all)
      const placeholders = targetRoles.map(() => "a.target_roles LIKE ?").join(" OR ");
      query += ` AND (a.target_roles IS NULL OR ${placeholders})`;
      for (const role of targetRoles) {
        params.push(`%${role}%`);
      }
    }

    query += ` ORDER BY a.created_at DESC`;
    return await this.client.query<any[]>(query, params);
  }

  async allAlerts(): Promise<any[]> {
    return await this.client.query<any[]>(`
      SELECT a.*, u.name as creator_name
      FROM alerts a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
  }

  async perscomNotificationsVisibleForUser(
    targetPerscomId: number,
    userId: string
  ): Promise<any[]> {
    return await this.client.query<any[]>(
      `
      SELECT n.*
      FROM perscom_notifications n
      LEFT JOIN perscom_notification_dismissals d
        ON d.notification_id = n.id AND d.user_id = ?
      WHERE n.target_perscom_id = ? AND d.id IS NULL
      ORDER BY n.created_at DESC
      `,
      [userId, targetPerscomId]
    );
  }

  async allPerscomNotifications(): Promise<any[]> {
    return await this.client.query<any[]>(
      `SELECT * FROM perscom_notifications ORDER BY created_at DESC`
    );
  }

  async perscomNotificationBelongsToUser(
    notificationId: number,
    userId: string
  ): Promise<boolean> {
    const rows = await this.client.query<{ id: number }[]>(
      `
      SELECT n.id
      FROM perscom_notifications n
      INNER JOIN users u ON u.perscom_id = n.target_perscom_id
      WHERE n.id = ? AND u.id = ?
      `,
      [notificationId, userId]
    );
    return rows.length > 0;
  }

  // ── SSE Items ──

  /**
   * @param opts string = legacy `campaignId` filter; object = filters including management scope
   */
  async sseItems(
    opts?:
      | string
      | {
          campaignId?: string;
          missionId?: string;
          scope?: string;
          uploadedBy?: string;
          status?: string;
        }
  ): Promise<any[]> {
    let query = `
      SELECT s.*, c.name as campaign_name, u.name as uploader_name
      FROM sse_items s
      LEFT JOIN campaigns c ON s.campaign_id = c.id
      LEFT JOIN users u ON s.uploaded_by = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (typeof opts === "string" || opts === undefined) {
      const campaignId = typeof opts === "string" ? opts : undefined;
      if (campaignId) {
        conditions.push("s.campaign_id = ?");
        params.push(campaignId);
      }
    } else {
      const { campaignId, missionId, scope, uploadedBy, status } = opts;
      if (scope === "management" && missionId) {
        conditions.push(`(
          s.mission_id = ?
          OR EXISTS (
            SELECT 1
            FROM sse_item_missions sim
            WHERE sim.sse_id = s.id AND sim.mission_id = ?
          )
        )`);
        params.push(missionId, missionId);
      } else if (scope === "management" && campaignId && !missionId) {
        conditions.push("s.campaign_id = ?");
        params.push(campaignId);
        conditions.push("s.mission_id IS NULL");
        conditions.push(
          "NOT EXISTS (SELECT 1 FROM sse_item_missions sim WHERE sim.sse_id = s.id)"
        );
      } else if (scope === "repository" && campaignId) {
        conditions.push("s.campaign_id = ?");
        params.push(campaignId);
        conditions.push("s.mission_id IS NULL");
        conditions.push(
          "NOT EXISTS (SELECT 1 FROM sse_item_missions sim WHERE sim.sse_id = s.id)"
        );
      } else if (campaignId) {
        conditions.push("s.campaign_id = ?");
        params.push(campaignId);
      }

      if (uploadedBy) {
        conditions.push("s.uploaded_by = ?");
        params.push(uploadedBy);
      }

      if (status) {
        conditions.push("s.status = ?");
        params.push(status);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY s.created_at DESC`;
    return await this.client.query<any[]>(query, params);
  }

  async sseItemById(id: number): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
      SELECT s.*, c.name as campaign_name, u.name as uploader_name
      FROM sse_items s
      LEFT JOIN campaigns c ON s.campaign_id = c.id
      LEFT JOIN users u ON s.uploaded_by = u.id
      WHERE s.id = ?
      `,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // ── Directives ──

  async directives(userId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
      SELECT d.*, u.name as user_name, a.name as assigner_name
      FROM directives d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN users a ON d.assigned_by = a.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
      `,
      [userId]
    );
  }

  async allDirectives(): Promise<any[]> {
    return await this.client.query<any[]>(`
      SELECT d.*, u.name as user_name, a.name as assigner_name
      FROM directives d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN users a ON d.assigned_by = a.id
      ORDER BY d.created_at DESC
    `);
  }

  // ── Operations (campaigns with op fields) ──

  async operationCampaigns(): Promise<any[]> {
    return await this.client.query<any[]>(`
      SELECT c.*,
             DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date,
             DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
             COUNT(DISTINCT m.id) as mission_count,
             COUNT(DISTINCT mr.user_id) as personnel_count
      FROM campaigns c
      LEFT JOIN missions m ON c.id = m.campaign_id
      LEFT JOIN mission_rsvps mr ON m.id = mr.mission_id AND mr.status = 'attending'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
  }

  async operationCampaignById(campaignId: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
      SELECT c.*,
             DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date,
             DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date
      FROM campaigns c
      WHERE c.id = ?
      `,
      [campaignId]
    );

    if (rows.length === 0) return null;
    return rows[0];
  }

  // ── Operation Documents ──

  /**
   * @param campaignPlanningOnly when true and missionId is omitted, only documents with mission_id IS NULL
   */
  async operationDocuments(
    campaignId: string,
    missionId?: string,
    campaignPlanningOnly = false
  ): Promise<any[]> {
    let query = `
      SELECT od.*,
             u.name as uploader_name,
             DATE_FORMAT(od.doc_date, '%Y-%m-%d') AS doc_date_fmt
      FROM operation_documents od
      LEFT JOIN users u ON od.uploaded_by = u.id
      WHERE od.campaign_id = ?
    `;
    const params: any[] = [campaignId];

    if (missionId) {
      query += ` AND (
        od.mission_id = ?
        OR EXISTS (
          SELECT 1
          FROM operation_document_missions odm
          WHERE odm.document_id = od.id AND odm.mission_id = ?
        )
      )`;
      params.push(missionId, missionId);
    } else if (campaignPlanningOnly) {
      query += ` AND od.mission_id IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM operation_document_missions odm
          WHERE odm.document_id = od.id
        )`;
    }

    query += ` ORDER BY od.created_at DESC`;
    return await this.client.query<any[]>(query, params);
  }

  async operationDocumentById(docId: number): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
      SELECT od.*, u.name as uploader_name,
             DATE_FORMAT(od.doc_date, '%Y-%m-%d') AS doc_date_fmt
      FROM operation_documents od
      LEFT JOIN users u ON od.uploaded_by = u.id
      WHERE od.id = ?
      `,
      [docId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async operationDocumentCampaignId(docId: number): Promise<string | null> {
    const rows = await this.client.query<{ campaign_id: string }[]>(
      `SELECT campaign_id FROM operation_documents WHERE id = ?`,
      [docId]
    );
    return rows.length > 0 ? rows[0].campaign_id : null;
  }

  async sseItemCampaignId(sseId: number): Promise<string | null> {
    const rows = await this.client.query<{ campaign_id: string }[]>(
      `SELECT campaign_id FROM sse_items WHERE id = ?`,
      [sseId]
    );
    return rows.length > 0 ? rows[0].campaign_id : null;
  }

  async operationDocumentMissionIds(docId: number): Promise<string[]> {
    const rows = await this.client.query<{ mission_id: string }[]>(
      `SELECT mission_id FROM operation_document_missions WHERE document_id = ?`,
      [docId]
    );
    return rows.map((r) => r.mission_id);
  }

  async documents(filters: {
    search?: string;
    unit?: string;
    classification?: string;
    tag?: string;
  } = {}): Promise<any[]> {
    const where: string[] = [];
    const params: any[] = [];

    if (filters.search) {
      where.push(`(d.name LIKE ? OR d.description LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.unit) {
      where.push(`d.unit = ?`);
      params.push(filters.unit);
    }
    if (filters.classification) {
      where.push(`d.classification = ?`);
      params.push(filters.classification);
    }
    if (filters.tag) {
      where.push(`EXISTS (SELECT 1 FROM document_tags dt2 WHERE dt2.document_id = d.id AND dt2.tag = ?)`);
      params.push(filters.tag);
    }

    const sql = `
      SELECT d.*, u.name AS uploader_name,
             DATE_FORMAT(d.created_at, '%Y-%m-%d') AS created_date
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY d.created_at DESC
    `;
    return this.client.query<any[]>(sql, params);
  }

  async documentById(documentId: number): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `SELECT d.*, u.name AS uploader_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = ?
       LIMIT 1`,
      [documentId]
    );
    return rows[0] ?? null;
  }

  async documentTags(documentId: number): Promise<string[]> {
    const rows = await this.client.query<{ tag: string }[]>(
      `SELECT tag FROM document_tags WHERE document_id = ? ORDER BY tag ASC`,
      [documentId]
    );
    return rows.map((row) => row.tag);
  }

  async documentAllowedRoles(documentId: number): Promise<string[]> {
    const rows = await this.client.query<{ role: string }[]>(
      `SELECT role FROM document_allowed_roles WHERE document_id = ?`,
      [documentId]
    );
    return rows.map((row) => row.role);
  }

  async documentAllowedUsers(documentId: number): Promise<string[]> {
    const rows = await this.client.query<{ user_id: string }[]>(
      `SELECT user_id FROM document_allowed_users WHERE document_id = ?`,
      [documentId]
    );
    return rows.map((row) => row.user_id);
  }

  async trainingDocuments(trainingId: string): Promise<any[]> {
    return this.client.query<any[]>(
      `SELECT d.*, td.training_id
       FROM training_documents td
       JOIN documents d ON d.id = td.document_id
       WHERE td.training_id = ?
       ORDER BY d.created_at DESC`,
      [trainingId]
    );
  }

  async sseItemMissionIds(sseId: number): Promise<string[]> {
    const rows = await this.client.query<{ mission_id: string }[]>(
      `SELECT mission_id FROM sse_item_missions WHERE sse_id = ?`,
      [sseId]
    );
    return rows.map((r) => r.mission_id);
  }

  // ── Operation Intel ──

  /** All intel rows for a campaign (images, narrative, etc.). */
  async operationIntel(campaignId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
      SELECT oi.*, u.name as creator_name
      FROM operation_intel oi
      LEFT JOIN users u ON oi.created_by = u.id
      WHERE oi.campaign_id = ?
      ORDER BY oi.created_at DESC
      `,
      [campaignId]
    );
  }

  /** Regional + operational narrative rows for campaign-level or a specific mission. */
  async operationIntelNarrativeRows(
    campaignId: string,
    missionId: string | null
  ): Promise<any[]> {
    return await this.client.query<any[]>(
      `
      SELECT oi.*, u.name as creator_name
      FROM operation_intel oi
      LEFT JOIN users u ON oi.created_by = u.id
      WHERE oi.campaign_id = ?
        AND oi.mission_id <=> ?
        AND oi.type IN ('regional', 'operational')
      ORDER BY oi.type ASC
      `,
      [campaignId, missionId]
    );
  }

  async missionCampaignId(missionId: string): Promise<string | null> {
    const rows = await this.client.query<{ campaign_id: string }[]>(
      `SELECT campaign_id FROM missions WHERE id = ?`,
      [missionId]
    );
    return rows.length > 0 ? rows[0].campaign_id : null;
  }

  // ── After Action Reports ──

  async afterActionReports(campaignId?: string, missionId?: string): Promise<any[]> {
    let query = `
      SELECT aar.*, c.name as campaign_name, m.name as mission_name,
             u.name as submitter_name, r.name as reviewer_name
      FROM after_action_reports aar
      LEFT JOIN campaigns c ON aar.campaign_id = c.id
      LEFT JOIN missions m ON aar.mission_id = m.id
      LEFT JOIN users u ON aar.submitted_by = u.id
      LEFT JOIN users r ON aar.reviewed_by = r.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (campaignId) {
      conditions.push("aar.campaign_id = ?");
      params.push(campaignId);
    }
    if (missionId) {
      conditions.push("aar.mission_id = ?");
      params.push(missionId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY aar.created_at DESC`;
    return await this.client.query<any[]>(query, params);
  }

  async afterActionReportById(id: number): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
      SELECT aar.*, c.name as campaign_name, m.name as mission_name,
             u.name as submitter_name, r.name as reviewer_name
      FROM after_action_reports aar
      LEFT JOIN campaigns c ON aar.campaign_id = c.id
      LEFT JOIN missions m ON aar.mission_id = m.id
      LEFT JOIN users u ON aar.submitted_by = u.id
      LEFT JOIN users r ON aar.reviewed_by = r.id
      WHERE aar.id = ?
      `,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

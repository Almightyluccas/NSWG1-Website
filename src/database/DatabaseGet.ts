import type {CustomHeroImages, RefreshTokenRow, User, UserFullInfo} from "@/types/database"
import type {DatabaseClient} from "./DatabaseClient"
import type {RecurringTraining, RecurringTrainingWithStats} from "@/types/recurring-training"
import type {
  DocumentAccessLog,
  FormDefinition,
  FormQuestion,
  FormSubmission,
  FormSubmissionAnswer,
  RawSubmissionQueryResult
} from "@/types/forms"
import {GalleryItem} from "@/types/objectStorage";

export class DatabaseGet {
  constructor(private client: DatabaseClient) {}

  async users(): Promise<User[]> {
    const rows = await this.client.query<any[]>(`
        SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
               u.email, u.created_at, u.role, i.image_url
        FROM users u
                 LEFT JOIN images i ON u.profile_image_id = i.id
    `)

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
    }))
  }

  async usersForSelection(): Promise<
    Array<{
      id: string
      name: string
      discord_username: string
      role: string[]
    }>
  > {
    const rows = await this.client.query<any[]>(`
        SELECT id, name, discord_username, role
        FROM users
        WHERE name IS NOT NULL AND name != ''
          AND role LIKE '%member%'
        ORDER BY name ASC
    `)

    return rows.map((row) => ({
      id: row.id,
      name: row.name || row.discord_username,
      discord_username: row.discord_username,
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
    }))
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
      [limit],
    )

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
    }))
  }

  async discordIdByPerscomId(perscomId: number): Promise<string | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT id FROM users WHERE perscom_id = ?
      `,
      [perscomId],
    )

    if (rows.length === 0) return null

    return rows[0].id || null
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
              up.homepage_image_url,
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
      [userId],
    );

    if (rows.length === 0) {
      return {
        roles: [],
        perscomId: null,
        name: null,
        preferences: { activeThemeName: null, homepageImageUrl: null },
        customThemes: [],
        imageUrl: null,
        discordName: null
      };
    }

    const firstRow = rows[0];
    const result: UserFullInfo = {
      roles: firstRow.role ? firstRow.role.split(",").map((r: string) => r.trim()) : [],
      perscomId: firstRow.perscom_id,
      name: firstRow.name,
      discordName: firstRow.discord_username,
      preferences: {
        activeThemeName: firstRow.active_theme_name,
        homepageImageUrl: firstRow.homepage_image_url,
      },
      customThemes: [],
      imageUrl: firstRow.image_url || null
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

  async userCount(): Promise<{ currentCount: number; percentChange: number; isPositive: boolean }> {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const currentResult = await this.client.query<any[]>(
      `
          SELECT COUNT(*) as count
          FROM users
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `,
      [currentMonth, currentYear],
    )

    const previousResult = await this.client.query<any[]>(
      `
          SELECT COUNT(*) as count
          FROM users
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `,
      [previousMonth, previousYear],
    )

    const currentCount = currentResult[0].count
    const previousCount = previousResult[0].count

    let percentChange = 0
    if (previousCount > 0) {
      percentChange = ((currentCount - previousCount) / previousCount) * 100
    } else if (currentCount > 0) {
      percentChange = 100
    }

    return {
      currentCount,
      percentChange: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0,
    }
  }

  async userProfilePictureByPerscomId(perscomId: number): Promise<string | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT i.image_url FROM users u LEFT JOIN images i ON i.id = u.profile_image_id WHERE u.perscom_id = ?
      `,
      [perscomId],
    )

    return rows.length > 0 ? rows[0].image_url : null
  }

  async userCustomHeroImages(id: string): Promise<CustomHeroImages[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT image_url, id FROM images WHERE author_id = ? AND image_type = 'hero'
      `,
      [id],
    )
    return rows.map(row => ({
      id: row.id,
      url: row.image_url
    }));
  }

  async refreshTokenByDetails(userId: string, ipAddress: string, userAgent: string) {
    const rows = await this.client.query<RefreshTokenRow[]>(
      `
      SELECT token_hash FROM refresh_tokens
      WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW() AND ip_address = ? AND user_agent = ?
    `,
      [userId, ipAddress, userAgent],
    );
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows[0] || null;
  }

  async getRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const rows = await this.client.query<RefreshTokenRow[]>(
      `
      SELECT user_id, expires_at, user_agent FROM refresh_tokens
      WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
    `,
      [tokenHash],
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
      `)
    }

    // For regular users, return all campaigns (they can see all but only RSVP to missions)
    return await this.client.query<any[]>(`
        SELECT c.*, DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date, DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
               COUNT(DISTINCT m.id) as mission_count
        FROM campaigns c
                 LEFT JOIN missions m ON c.id = m.campaign_id
        GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, c.status, c.created_by, c.created_at, c.updated_at
        ORDER BY c.created_at DESC
    `)
  }

  async campaignById(campaignId: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT * FROM campaigns WHERE id = ?
      `,
      [campaignId],
    )
    return rows.length > 0 ? rows[0] : null
  }

  async missionsByCampaign(campaignId: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date FROM missions
          WHERE campaign_id = ?
          ORDER BY date ASC, time ASC
      `,
      [campaignId],
    )
  }

  async missionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    return await this.client.query<any[]>(
      `
          SELECT m.*, c.name as campaign_name, DATE_FORMAT(m.date, '%Y-%m-%d') as date
          FROM missions m
                   LEFT JOIN campaigns c ON m.campaign_id = c.id
          WHERE m.date BETWEEN ? AND ?
          ORDER BY m.date ASC, m.time ASC
      `,
      [startDate, endDate],
    )
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
      [missionId],
    )
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
      [missionId],
    )
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
      `)
      return rows
    }

    // For regular users, return all training records (they can see all but only RSVP)
    const rows = await this.client.query<any[]>(`
        SELECT t.*, DATE_FORMAT(t.date, '%Y-%m-%d') as date,
               COUNT(DISTINCT tr.id) as rsvp_count
        FROM training_records t
                 LEFT JOIN training_rsvps tr ON t.id = tr.training_id
        GROUP BY t.id, t.name, t.description, t.date, t.time, t.location, t.instructor, t.max_personnel, t.status, t.created_by, t.created_at, t.updated_at
        ORDER BY t.date DESC, t.time DESC
    `)
    return rows
  }

  async trainingByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date FROM training_records
          WHERE date BETWEEN ? AND ?
          ORDER BY date ASC, time ASC
      `,
      [startDate, endDate],
    )
    return rows
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
      [trainingId],
    )
    return rows
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
      [trainingId],
    )
    return rows
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
      [userId],
    )

    const trainingAttendance = await this.client.query<any[]>(
      `
          SELECT ta.*, t.name as event_name, DATE_FORMAT(t.date, '%Y-%m-%d') as date, 'training' as event_type
          FROM training_attendance ta
                   JOIN training_records t ON ta.training_id = t.id
          WHERE ta.user_id = ?
      `,
      [userId],
    )

    return [...missionAttendance, ...trainingAttendance].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
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
    `)

    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return rows.map((row) => ({
      ...row,
      instances_created: row.instances_created || 0,
      created_by_name: row.created_by_name || "Unknown",
      dayName: DAY_NAMES[row.day_of_week] || "Unknown",
    }))
  }

  async recurringTrainingById(id: string): Promise<RecurringTraining | null> {
    const rows = await this.client.query<any[]>(`SELECT * FROM recurring_trainings WHERE id = ?`, [id])
    return rows.length > 0 ? (rows[0] as RecurringTraining) : null
  }

  async activeRecurringTrainings(): Promise<RecurringTraining[]> {
    const rows = await this.client.query<any[]>(`SELECT * FROM recurring_trainings WHERE is_active = TRUE`)
    return rows as RecurringTraining[]
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
      [recurringId],
    )
    return rows
  }

  async recurringTrainingInstanceExists(recurringId: string, scheduledDate: string): Promise<boolean> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM recurring_training_instances WHERE recurring_training_id = ? AND scheduled_date = ?`,
      [recurringId, scheduledDate],
    )
    return rows.length > 0
  }



  async missionConflictsOnDate(date: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM missions WHERE date = ? AND status IN ('scheduled', 'in-progress')`,
      [date],
    )
    return rows
  }

  async trainingRecordByDetails(name: string, date: string, time: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM training_records WHERE name = ? AND date = ? AND time = ? ORDER BY created_at DESC LIMIT 1`,
      [name, date, time],
    )
    return rows.length > 0 ? rows[0] : null
  }

  // Forms methods
  async getForms(): Promise<FormDefinition[]> {
    const forms = await this.client.query<FormDefinition[]>(
      `SELECT * FROM form_definitions WHERE is_active = true ORDER BY created_at DESC`,
    )
    return forms
  }

  async getFormWithQuestions(formId: number): Promise<FormDefinition | null> {
    const [form] = await this.client.query<FormDefinition[]>(`SELECT * FROM form_definitions WHERE id = ?`, [formId])

    if (!form) return null

    const questions = await this.client.query<FormQuestion[]>(
      `SELECT * FROM form_questions WHERE form_id = ? ORDER BY order_index ASC`,
      [formId],
    )

    const parsedQuestions = questions.map((q) => {
      let options: string[] | undefined = undefined

      if (q.options !== null && typeof q.options !== "undefined") {

        const optionsValue = q.options

        if (Array.isArray(optionsValue)) {
          options = optionsValue.map((opt) => String(opt).trim()).filter((opt) => opt.length > 0)
        } else {
          const optionsStr = String(optionsValue)

          try {
            const parsedJson = JSON.parse(optionsStr)
            if (Array.isArray(parsedJson)) {
              options = parsedJson.map((opt) => String(opt).trim()).filter((opt) => opt.length > 0)
            } else if (typeof parsedJson === "string" && parsedJson.includes(",")) {
              options = parsedJson
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt.length > 0)
            } else if (typeof parsedJson === "string" && parsedJson.length > 0) {
              options = [parsedJson.trim()]
            }
          } catch {
            if (optionsStr.includes(",")) {
              options = optionsStr
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt.length > 0)
            } else if (optionsStr.length > 0) {
              options = [optionsStr.trim()]
            }
          }
        }
      }

      return {
        ...q,
        options,
      }
    })

    return { ...form, questions: parsedQuestions }
  }

  async getFormSubmissions(formId: number): Promise<FormSubmission[]> {
    const submissions = await this.client.query<FormSubmission[]>(
      `SELECT * FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC`,
      [formId],
    )

    for (const submission of submissions) {
      const answers = await this.client.query<FormSubmissionAnswer[]>(
        `SELECT fsa.*, fq.question_text, fq.question_type
         FROM form_submission_answers fsa
                  JOIN form_questions fq ON fsa.question_id = fq.id
         WHERE fsa.submission_id = ?
         ORDER BY fq.order_index ASC`,
        [submission.id],
      )

      submission.answers = answers.map((a) => ({
        ...a,
        answer_json: a.answer_json ? JSON.parse(a.answer_json as string) : undefined,
      }))
    }

    return submissions
  }

  async getDocumentAccessLogs(limit = 100): Promise<DocumentAccessLog[]> {
    const logs = await this.client.query<DocumentAccessLog[]>(
      `SELECT * FROM document_access_logs 
       ORDER BY accessed_at DESC 
       LIMIT ?`,
      [limit],
    )

    return logs
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
      [userId],
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
        if (row.options !== null && typeof row.options !== 'undefined') {
          if (typeof row.options === 'string') {
            try {
              let optionsString = row.options.trim();
              if (optionsString.startsWith('[') && optionsString.endsWith(']') && optionsString.includes("'")) {
                optionsString = optionsString.replace(/'/g, '"');
              }
              parsedOptions = JSON.parse(optionsString);
            } catch (e) {
              console.error(`Error parsing options for question ID ${row.question_id} (string format):`, row.options, e);
              parsedOptions = undefined;
            }
          } else if (Array.isArray(row.options)) {
            parsedOptions = row.options as string[];
          } else {
            console.warn(`Unexpected type for options for question ID ${row.question_id}:`, typeof row.options, row.options);
            parsedOptions = undefined;
          }
        }

        let parsedAnswerJson: any | undefined;
        try {
          if (row.answer_json) {
            parsedAnswerJson = JSON.parse(row.answer_json);
          }
        } catch (e) {
          console.error(`Error parsing answer_json for answer ID ${row.answer_id}:`, row.answer_json, e);
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
      `SELECT i.title, i.alt_text, i.description, i.category, i.unit, u.display_order FROM images AS i JOIN gallery_items AS u ON i.id = u.image_id`
    );
  }
}

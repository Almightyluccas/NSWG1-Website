import type { User } from "@/types/database";
import type { DatabaseClient } from "./DatabaseClient";
import type { RecurringTraining, RecurringTrainingWithStats } from "@/types/recurring-training";
import { toZonedTime } from 'date-fns-tz';

const convertUtcToNewYork = (date: Date | string | null): Date | null => {
  if (!date) return null;

  const inputDate = typeof date === 'string' ? new Date(date) : date;

  if (process.env.NODE_ENV === 'production') {
    return toZonedTime(inputDate, 'America/New_York');
  } else {
    return inputDate;
  }
};

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
      date_of_birth: row.date_of_birth ? convertUtcToNewYork(row.date_of_birth) : null,
      email: row.email,
      created_at: convertUtcToNewYork(row.created_at) as Date, // Cast as non-null as it should always exist
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
      [limit],
    );

    return rows.map((row) => ({
      id: row.id,
      perscom_id: row.perscom_id,
      steam_id: row.steam_id,
      discord_username: row.discord_username,
      name: row.name,
      date_of_birth: row.date_of_birth ? convertUtcToNewYork(row.date_of_birth) : null,
      email: row.email,
      created_at: convertUtcToNewYork(row.created_at) as Date,
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
      imageUrl: row.image_url || null,
    }));
  }

  async userInfo(userId: string): Promise<{ roles: string[]; perscomId: string | null; name: string | null }> {
    const rows = await this.client.query<any[]>(
      `
          SELECT role, perscom_id, name
          FROM users
          WHERE id = ?
      `,
      [userId],
    );

    if (rows.length === 0) {
      return { roles: [], perscomId: null, name: null };
    }

    const { role, perscom_id, name } = rows[0];
    return {
      roles: role ? role.split(",").map((r: string) => r.trim()) : [],
      perscomId: perscom_id,
      name,
    };
  }

  async userCount(): Promise<{ currentCount: number; percentChange: number; isPositive: boolean }> {
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
      [currentMonth, currentYear],
    );

    const previousResult = await this.client.query<any[]>(
      `
          SELECT COUNT(*) as count
          FROM users
          WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
      `,
      [previousMonth, previousYear],
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

  async userRefreshToken(userId: string): Promise<string> {
    const rows = await this.client.query("SELECT token_hash FROM refresh_tokens WHERE id = ?", [userId]);

    if (!rows || (rows as any[]).length === 0) throw new Error("No refresh token found");

    return (rows as any[])[0].refresh_token;
  }

  // Campaign methods
  async campaigns(userId?: string, isAdmin = false): Promise<any[]> {
    if (isAdmin) {
      const rows = await this.client.query<any[]>(`
          SELECT c.*,
                 COUNT(DISTINCT m.id) as mission_count
          FROM campaigns c
                   LEFT JOIN missions m ON c.id = m.campaign_id
          GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, c.status, c.created_by, c.created_at, c.updated_at
          ORDER BY c.created_at DESC
      `);
      return rows.map(row => ({
        ...row,
        start_date: row.start_date ? convertUtcToNewYork(row.start_date) : null,
        end_date: row.end_date ? convertUtcToNewYork(row.end_date) : null,
        created_at: convertUtcToNewYork(row.created_at),
        updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
      }));
    }

    const rows = await this.client.query<any[]>(`
        SELECT c.*,
               COUNT(DISTINCT m.id) as mission_count
        FROM campaigns c
                 LEFT JOIN missions m ON c.id = m.campaign_id
        GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, c.status, c.created_by, c.created_at, c.updated_at
        ORDER BY c.created_at DESC
    `);
    return rows.map(row => ({
      ...row,
      start_date: row.start_date ? convertUtcToNewYork(row.start_date) : null,
      end_date: row.end_date ? convertUtcToNewYork(row.end_date) : null,
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async campaignById(campaignId: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `
          SELECT * FROM campaigns WHERE id = ?
      `,
      [campaignId],
    );
    if (rows.length > 0) {
      const row = rows[0];
      return {
        ...row,
        start_date: row.start_date ? convertUtcToNewYork(row.start_date) : null,
        end_date: row.end_date ? convertUtcToNewYork(row.end_date) : null,
        created_at: convertUtcToNewYork(row.created_at),
        updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
      };
    }
    return null;
  }

  async missionsByCampaign(campaignId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT * FROM missions
          WHERE campaign_id = ?
          ORDER BY date ASC, time ASC
      `,
      [campaignId],
    );
    return rows.map(row => ({
      ...row,
      date: convertUtcToNewYork(row.date),
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async missionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    console.log("Fetching missions between", startDate, "and", endDate);
    const rows = await this.client.query<any[]>(
      `
          SELECT m.*, c.name as campaign_name
          FROM missions m
                   LEFT JOIN campaigns c ON m.campaign_id = c.id
          WHERE m.date BETWEEN ? AND ?
          ORDER BY m.date ASC, m.time ASC
      `,
      [startDate, endDate],
    );
    console.log("Found missions:", rows.length);
    return rows.map(row => ({
      ...row,
      date: convertUtcToNewYork(row.date),
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async missionRSVPs(missionId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT mr.*, u.name as user_name
          FROM mission_rsvps mr
                   JOIN users u ON mr.user_id = u.id
          WHERE mr.mission_id = ?
          ORDER BY mr.created_at ASC
      `,
      [missionId],
    );
    return rows.map(row => ({
      ...row,
      created_at: convertUtcToNewYork(row.created_at),
    }));
  }

  async missionAttendance(missionId: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `
          SELECT ma.*, u.name as user_name, marker.name as marked_by_name
          FROM mission_attendance ma
                   JOIN users u ON ma.user_id = u.id
                   JOIN users marker ON ma.marked_by = marker.id
          WHERE ma.mission_id = ?
          ORDER BY ma.marked_at ASC
      `,
      [missionId],
    );
    return rows.map(row => ({
      ...row,
      marked_at: convertUtcToNewYork(row.marked_at),
    }));
  }

  // Training methods
  async trainingRecords(userId?: string, isAdmin = false): Promise<any[]> {
    if (isAdmin) {
      const rows = await this.client.query<any[]>(`
          SELECT t.*,
                 COUNT(DISTINCT tr.id) as rsvp_count
          FROM training_records t
                   LEFT JOIN training_rsvps tr ON t.id = tr.training_id
          GROUP BY t.id, t.name, t.description, t.date, t.time, t.location, t.instructor, t.max_personnel, t.status, t.created_by, t.created_at, t.updated_at
          ORDER BY t.date DESC, t.time DESC
      `);
      return rows.map(row => ({
        ...row,
        date: convertUtcToNewYork(row.date),
        created_at: convertUtcToNewYork(row.created_at),
        updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
      }));
    }

    const rows = await this.client.query<any[]>(`
        SELECT t.*,
               COUNT(DISTINCT tr.id) as rsvp_count
        FROM training_records t
                 LEFT JOIN training_rsvps tr ON t.id = tr.training_id
        GROUP BY t.id, t.name, t.description, t.date, t.time, t.location, t.instructor, t.max_personnel, t.status, t.created_by, t.created_at, t.updated_at
        ORDER BY t.date DESC, t.time DESC
    `);
    return rows.map(row => ({
      ...row,
      date: convertUtcToNewYork(row.date),
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async trainingByDateRange(startDate: string, endDate: string): Promise<any[]> {
    console.log("Fetching training between", startDate, "and", endDate);
    const rows = await this.client.query<any[]>(
      `
          SELECT * FROM training_records
          WHERE date BETWEEN ? AND ?
          ORDER BY date ASC, time ASC
      `,
      [startDate, endDate],
    );
    console.log("Found training records:", rows.length);
    return rows.map(row => ({
      ...row,
      date: convertUtcToNewYork(row.date),
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
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
    );
    return rows.map(row => ({
      ...row,
      created_at: convertUtcToNewYork(row.created_at),
    }));
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
    );
    return rows.map(row => ({
      ...row,
      marked_at: convertUtcToNewYork(row.marked_at),
    }));
  }

  // Attendance methods
  async attendanceRecords(userId: string): Promise<any[]> {
    const missionAttendance = await this.client.query<any[]>(
      `
          SELECT ma.*, m.name as event_name, m.date, 'mission' as event_type
          FROM mission_attendance ma
                   JOIN missions m ON ma.mission_id = m.id
          WHERE ma.user_id = ?
      `,
      [userId],
    );

    const trainingAttendance = await this.client.query<any[]>(
      `
          SELECT ta.*, t.name as event_name, t.date, 'training' as event_type
          FROM training_attendance ta
                   JOIN training_records t ON ta.training_id = t.id
          WHERE ta.user_id = ?
      `,
      [userId],
    );

    const combined = [
      ...missionAttendance.map(row => ({
        ...row,
        date: convertUtcToNewYork(row.date),
        marked_at: convertUtcToNewYork(row.marked_at),
      })),
      ...trainingAttendance.map(row => ({
        ...row,
        date: convertUtcToNewYork(row.date),
        marked_at: convertUtcToNewYork(row.marked_at),
      })),
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return rows.map((row) => ({
      ...row,
      instances_created: row.instances_created || 0,
      created_by_name: row.created_by_name || "Unknown",
      dayName: DAY_NAMES[row.day_of_week] || "Unknown",
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async recurringTrainingById(id: string): Promise<RecurringTraining | null> {
    const rows = await this.client.query<any[]>(`SELECT * FROM recurring_trainings WHERE id = ?`, [id]);
    if (rows.length > 0) {
      const row = rows[0];
      return {
        ...row,
        created_at: convertUtcToNewYork(row.created_at),
        updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
      } as RecurringTraining;
    }
    return null;
  }

  async activeRecurringTrainings(): Promise<RecurringTraining[]> {
    const rows = await this.client.query<any[]>(`SELECT * FROM recurring_trainings WHERE is_active = TRUE`);
    return rows.map(row => ({
      ...row,
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    })) as RecurringTraining[];
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
    );
    return rows.map(row => ({
      ...row,
      scheduled_date: convertUtcToNewYork(row.scheduled_date),
      date: convertUtcToNewYork(row.date),
      created_at: convertUtcToNewYork(row.created_at),
      updated_at: row.updated_at ? convertUtcToNewYork(row.updated_at) : null,
    }));
  }

  async recurringTrainingInstanceExists(recurringId: string, scheduledDate: string): Promise<boolean> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM recurring_training_instances WHERE recurring_training_id = ? AND scheduled_date = ?`,
      [recurringId, scheduledDate],
    );
    return rows.length > 0;
  }

  async missionConflictsOnDate(date: string): Promise<any[]> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM missions WHERE date = ? AND status IN ('scheduled', 'in-progress')`,
      [date],
    );
    return rows;
  }

  async trainingRecordByDetails(name: string, date: string, time: string): Promise<any | null> {
    const rows = await this.client.query<any[]>(
      `SELECT id FROM training_records WHERE name = ? AND date = ? AND time = ? ORDER BY created_at DESC LIMIT 1`,
      [name, date, time],
    );
    if (rows.length > 0) {
      const row = rows[0];
      return {
        ...row,
        created_at: convertUtcToNewYork(row.created_at),
      };
    }
    return null;
  }
}
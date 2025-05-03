import type { UserInformation } from "@/types/database"
import type { DatabaseClient } from "./DatabaseClient"

export class DatabaseGet {
  constructor(private client: DatabaseClient) {}

  async users(): Promise<UserInformation[]> {
    const rows = await this.client.query<any[]>(`
      SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
             u.email, u.created_at, u.role, i.image_url
      FROM users u
      LEFT JOIN images i ON u.profile_image_id = i.id
    `)

    return rows.map(row => ({
      id: row.id,
      perscom_id: row.perscom_id,
      steam_id: row.steam_id,
      discord_username: row.discord_username,
      name: row.name,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      email: row.email,
      created_at: new Date(row.created_at),
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
      imageUrl: row.image_url || null
    }))
  }

  async recentUsers(limit: number): Promise<UserInformation[]> {
    const rows = await this.client.query<any[]>(`
      SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
             u.email, u.created_at, u.role, i.image_url
      FROM users u
      LEFT JOIN images i ON u.profile_image_id = i.id
      ORDER BY u.created_at DESC
      LIMIT ?
    `, [limit])

    return rows.map(row => ({
      id: row.id,
      perscom_id: row.perscom_id,
      steam_id: row.steam_id,
      discord_username: row.discord_username,
      name: row.name,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      email: row.email,
      created_at: new Date(row.created_at),
      role: row.role ? row.role.split(",").map((r: string) => r.trim()) : [],
      imageUrl: row.image_url || null
    }))
  }

  async userInfo(userId: string): Promise<{ roles: string[]; perscomId: string | null; name: string | null }> {
    const rows = await this.client.query<any[]>(`
      SELECT role, perscom_id, name
      FROM users
      WHERE id = ?
    `, [userId])

    if (rows.length === 0) {
      return { roles: [], perscomId: null, name: null }
    }

    const { role, perscom_id, name } = rows[0]
    return {
      roles: role ? role.split(",").map((r: string) => r.trim()) : [],
      perscomId: perscom_id,
      name
    }
  }

  async userCount(): Promise<{ currentCount: number; percentChange: number; isPositive: boolean }> {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const currentResult = await this.client.query<any[]>(`
      SELECT COUNT(*) as count
      FROM users
      WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
    `, [currentMonth, currentYear])

    const previousResult = await this.client.query<any[]>(`
      SELECT COUNT(*) as count
      FROM users
      WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
    `, [previousMonth, previousYear])

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
      isPositive: percentChange >= 0
    }
  }

  async userRefreshToken(userId: string): Promise<string> {
    const rows = await this.client.query(
      "SELECT refresh_token FROM users WHERE id = ?",
      [userId]
    );

    if (!rows || (rows as any[]).length === 0) throw new Error("No refresh token found");


    return (rows as any[])[0].refresh_token;

  }
}
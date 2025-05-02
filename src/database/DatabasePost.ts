import type { DatabaseClient } from "./DatabaseClient"

export class DatabasePost {
  constructor(private client: DatabaseClient) {}

  async user(id: string, discord_username: string, email: string): Promise<void> {
    await this.client.query(`
      INSERT IGNORE INTO users (id, discord_username, email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        discord_username = VALUES(discord_username),
        email = VALUES(email)
    `, [id, discord_username, email])
  }

  async refreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.client.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `, [userId, tokenHash, expiresAt])
  }

  async userProfileImage(userId: string, imageUrl: string): Promise<number | null> {
    const result = await this.client.query<any>(`
      INSERT INTO images (user_id, image_url, image_type, reference_id, reference_type)
      VALUES (?, ?, 'profile', ?, 'user')
    `, [userId, imageUrl, userId])

    const imageId = result.insertId
    await this.client.query(`
      UPDATE users SET profile_image_id = ? WHERE id = ?
    `, [imageId, userId])

    return imageId
  }
}
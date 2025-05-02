import { UserRole } from "@/types/database"
import type { DatabaseClient } from "./DatabaseClient"

export class DatabaseMigrate {
  constructor(private client: DatabaseClient) {}

  async migrate(): Promise<void> {
    const roleValues = Object.values(UserRole)
      .map(role => `'${role}'`)
      .join(',')

    await this.createUsersTable(roleValues)
    await this.createRefreshTokensTable()
    await this.createImagesTable()
  }

  private async createUsersTable(roleValues: string): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        perscom_id INT NULL UNIQUE,
        steam_id VARCHAR(255) NULL UNIQUE,
        discord_username VARCHAR(255) NOT NULL,
        name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role SET (${roleValues}) DEFAULT '${UserRole.guest}',
        profile_image_id INT NULL,
        FOREIGN KEY (profile_image_id) REFERENCES images(id)   
      )
    `)
  }

  private async createRefreshTokensTable(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)
  }

  private async createImagesTable(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NULL,
        image_url VARCHAR(255) NOT NULL,
        image_type ENUM('profile', 'system', 'content', 'banner') NOT NULL,
        reference_id VARCHAR(255) NULL,
        reference_type VARCHAR(50) NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)
  }
}
import pool from './connection';
import {PoolConnection} from "mysql2/promise";

export default async function migrateDb(): Promise<void> {
  const connection: PoolConnection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        perscom_id INT NULL UNIQUE,
        steam_id VARCHAR(255) NULL UNIQUE,
        discord_username VARCHAR(255) NOT NULL,
        name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role SET ('guest','applicant','candidate','greenTeam','member','160th','tacdevron','admin','superAdmin') DEFAULT 'guest'
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       VARCHAR(255) NOT NULL,
        token_hash    VARCHAR(255) NOT NULL,
        issued_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at    DATETIME     NOT NULL,
        revoked_at    DATETIME     NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );    
    `)

  } finally {
    connection.release();
  }

}


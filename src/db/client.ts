import pool from "@/db/connection";

export const addUserDb = async (id: string, username: string, email: string): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      INSERT IGNORE INTO users (id, username, email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        email = VALUES(email)
    `, [id, username, email]);

  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}

export const addRefreshTokenDb = async (userId: string, tokenHash: string, expiresAt: Date): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `, [userId, tokenHash, expiresAt]);

  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}

export const retrieveUserRolesDb = async (userId: string): Promise<string[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT role FROM users WHERE id = ?
    `, [userId]);

    if (Array.isArray(rows) && rows.length > 0) {
      const rolesString = (rows[0] as { roles: string }).roles;
      return rolesString.split(",").map(role => role.trim());
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}
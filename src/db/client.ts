import pool from "@/db/connection";

export const addUserDb = async (id: string, discord_username: string, email: string): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      INSERT IGNORE INTO users (id, discord_username, email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        discord_username = VALUES(discord_username),
        email = VALUES(email)
    `, [id, discord_username, email]);

  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}

export const updateUserAfterApplicationDb = async (
  id: string,
  perscom_id: number,
  name: string,
  steam_id: string,
  date_of_birth: Date
): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
        UPDATE users
        SET perscom_id = ?, name = ?, date_of_birth = ?, steam_id = ?, role = 'applicant'
        WHERE id = ?
    `, [perscom_id, name, date_of_birth, steam_id, id]);

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

export const retrieveUserInfoDb = async (userId: string): Promise<{
  roles: string[];
  perscomId: string | null;
  name: string | null;
}> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `
          SELECT role, perscom_id, name
          FROM users
          WHERE id = ?
      `,
      [userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const { role, perscom_id, name } = rows[0] as {
        role: string | null;
        perscom_id: string | null;
        name: string | null;
      };
      const roles = role ? role.split(",").map((r: string) => r.trim()) : [];
      return { roles, perscomId: perscom_id, name };
    }
    return { roles: [], perscomId: null, name: null };
  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
};

export const updateUserRolePerscomIdDb = async (role: string, perscomId: number): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      UPDATE users
      SET role = ?
      WHERE perscom_id = ?
    `, [role, perscomId]);

  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}


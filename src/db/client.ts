import pool from "@/db/connection";
import { UserInformation, UserRole } from "@/types/database";

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

export const getAllUsersDb = async (): Promise<UserInformation[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT id, perscom_id, steam_id, discord_username, name, date_of_birth, email, created_at, role
      FROM users
    `);

    if (!Array.isArray(rows)) return [];

    return rows.map((row: any) => {
      const user: UserInformation = {
        id: row.id,
        perscom_id: row.perscom_id,
        steam_id: row.steam_id,
        discord_username: row.discord_username,
        name: row.name,
        date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
        email: row.email,
        created_at: new Date(row.created_at),
        role: row.role ? row.role.split(",").map((r: string) => r.trim() as UserRole) : []
      };
      return user;
    });
  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}

export const getUserCountWithTrendDb = async (): Promise<{
  currentCount: number;
  percentChange: number;
  isPositive: boolean;
}> => {
  const connection = await pool.getConnection();
  try {
    // Get current and previous month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear -= 1;
    }

    const [currentResult] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
    `, [currentMonth, currentYear]);

    const [previousResult] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
    `, [previousMonth, previousYear]);

    const currentCount = Array.isArray(currentResult) && currentResult.length > 0 ?
      (currentResult[0] as { count: number }).count : 0;

    const previousCount = Array.isArray(previousResult) && previousResult.length > 0 ?
      (previousResult[0] as { count: number }).count : 0;

    let percentChange = 0;
    if (previousCount > 0) {
      percentChange = ((currentCount - previousCount) / previousCount) * 100;
    } else if (currentCount > 0) {
      percentChange = 100;
    }

    return {
      currentCount,
      percentChange: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0
    };
  } catch (error) {
    console.error("Error calculating user trend:", error);
    return { currentCount: 0, percentChange: 0, isPositive: true };
  } finally {
    connection.release();
  }
}



export const getRecentUsersDb = async (limit: number): Promise<UserInformation[]> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
        SELECT u.id, u.perscom_id, u.steam_id, u.discord_username, u.name, u.date_of_birth,
               u.email, u.created_at, u.role, i.image_url
        FROM users u
                 LEFT JOIN images i ON u.profile_image_id = i.id
        ORDER BY u.created_at DESC
        LIMIT ?
    `, [limit]);

    if (!Array.isArray(rows)) return [];

    return rows.map((row: any) => {
      const user: UserInformation = {
        id: row.id,
        perscom_id: row.perscom_id,
        steam_id: row.steam_id,
        discord_username: row.discord_username,
        name: row.name,
        date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
        email: row.email,
        created_at: new Date(row.created_at),
        role: row.role ? row.role.split(",").map((r: string) => r.trim() as UserRole) : [],
        imageUrl: row.image_url || null
      };
      return user;
    });
  } catch (error) {
    return Promise.reject(error);
  } finally {
    connection.release();
  }
}

export async function saveUserProfileImageDb(userId: string, imageUrl: string): Promise<number | null> {
  const connection = await pool.getConnection();
  try {
    const [imageResult] = await connection.query(
      `INSERT INTO images (user_id, image_url, image_type, reference_id, reference_type)
       VALUES (?, ?, 'profile', ?, 'user')`,
      [userId, imageUrl, userId]
    );

    const imageId = (imageResult as any).insertId;

    await connection.query(
      `UPDATE users SET profile_image_id = ? WHERE id = ?`,
      [imageId, userId]
    );

    return imageId;
  } catch (error) {
    console.error("Error saving profile image:", error);
    return null;
  } finally {
    connection.release();
  }
}


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


import type { DatabaseClient } from "./DatabaseClient"

export class DatabasePut {
  constructor(private client: DatabaseClient) {}

  async userAfterApplication(
    id: string,
    perscom_id: number,
    name: string,
    steam_id: string,
    date_of_birth: Date
  ): Promise<void> {
    await this.client.query(`
      UPDATE users
      SET perscom_id = ?, name = ?, date_of_birth = ?, steam_id = ?, role = 'applicant'
      WHERE id = ?
    `, [perscom_id, name, date_of_birth, steam_id, id])
  }

  async userRoleByPerscomId(roles: string | string[], perscomId: number): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(',') : roles
    await this.client.query(`
      UPDATE users
      SET role = ?
      WHERE perscom_id = ?
    `, [roleString, perscomId])
  }

  async userRoleByUserId(roles: string | string[], userId: string): Promise<void> {
    const roleString = Array.isArray(roles) ? roles.join(',') : roles
    await this.client.query(`
      UPDATE users
      SET role = ?
      WHERE id = ?
    `, [roleString, userId])
  }
}
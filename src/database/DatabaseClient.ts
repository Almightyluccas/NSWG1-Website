import mysql, { Pool } from 'mysql2/promise'
import { DatabaseGet } from "./DatabaseGet"
import { DatabasePost } from "./DatabasePost"
import { DatabasePut } from "./DatabasePut"
import { DatabaseDelete } from "./DatabaseDelete"
// import { DatabaseMigrate } from "./DatabaseMigrate"

export class DatabaseClient {
  private static instance: DatabaseClient
  private readonly pool: Pool
  readonly get: DatabaseGet
  readonly post: DatabasePost
  readonly put: DatabasePut
  readonly delete: DatabaseDelete
  // readonly migrate: DatabaseMigrate

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0,
    })

    this.get = new DatabaseGet(this)
    this.post = new DatabasePost(this)
    this.put = new DatabasePut(this)
    this.delete = new DatabaseDelete(this)
    // this.migrate = new DatabaseMigrate(this)
  }

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient()
    }
    return DatabaseClient.instance
  }

  async query<T>(sql: string, values?: any[]): Promise<T> {
    const connection = await this.pool.getConnection()
    try {
      const [result] = await connection.query(sql, values)
      return result as T
    } finally {
      connection.release()
    }
  }
}

//TODO: Fix the singleton pattern becuase it apparaently doesn't work on vercel..
//TODO: the issue with shwoing on the wrong date is when retreiving from database it puts the wrong date
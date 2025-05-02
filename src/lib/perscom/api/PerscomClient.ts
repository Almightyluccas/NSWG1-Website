import { PerscomGet } from './PerscomGet'
import { PerscomPost } from './PerscomPost'
import { PerscomPatch } from './PerscomPatch'

export class PerscomClient {
  private readonly apiKey: string
  private readonly apiUrl: string
  readonly get: PerscomGet
  readonly post: PerscomPost
  readonly patch: PerscomPatch

  constructor() {
    this.apiKey = process.env.PERSCOM_API_KEY!
    this.apiUrl = process.env.PERSCOM_API_URL!
    this.get = new PerscomGet(this)
    this.post = new PerscomPost(this)
    this.patch = new PerscomPatch(this)
  }

  async fetch<T>(endpoint: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Perscom API error: ${response.status}`)
    }

    return response.json()
  }
}
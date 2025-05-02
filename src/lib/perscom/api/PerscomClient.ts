import { PerscomGet } from './PerscomGet'
import { PerscomPost } from './PerscomPost'
import { PerscomPatch } from './PerscomPatch'

export const sharedCache: Record<string, { data: any; timestamp: number }> = {};

export class PerscomClient {
  private readonly apiKey: string
  private readonly apiUrl: string

  private _get?: PerscomGet
  private _post?: PerscomPost
  private _patch?: PerscomPatch

  constructor() {
    this.apiKey = process.env.PERSCOM_API_KEY!
    this.apiUrl = process.env.PERSCOM_API_URL!
  }

  get get(): PerscomGet {
    if (!this._get) {
      this._get = new PerscomGet(this, sharedCache)
    }
    return this._get
  }

  get post(): PerscomPost {
    if (!this._post) {
      this._post = new PerscomPost(this)
    }
    return this._post
  }

  get patch(): PerscomPatch {
    if (!this._patch) {
      this._patch = new PerscomPatch(this)
    }
    return this._patch
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
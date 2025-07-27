import { PerscomGet } from './PerscomGet'
import { PerscomPost } from './PerscomPost'
import { PerscomPatch } from './PerscomPatch'
import {PerscomDelete} from "@/lib/perscom/api/PerscomDelete";

export const sharedCache: Record<string, { data: any; timestamp: number }> = {};
export const CACHE_DURATION_MS = 5 * 60 * 1000


export class PerscomClient {
  private readonly apiKey: string
  private readonly apiUrl: string
  private _get?: PerscomGet
  private _post?: PerscomPost
  private _patch?: PerscomPatch
  private _delete?: PerscomDelete
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor() {
    this.apiKey = process.env.PERSCOM_API_KEY!
    this.apiUrl = process.env.PERSCOM_API_URL!
  }

  get get(): PerscomGet {
    if (!this._get) this._get = new PerscomGet(this, sharedCache)
    return this._get
  }

  get post(): PerscomPost {
    if (!this._post) this._post = new PerscomPost(this)
    return this._post
  }

  get patch(): PerscomPatch {
    if (!this._patch) this._patch = new PerscomPatch(this)
    return this._patch
  }

  get delete(): PerscomDelete {
    if (!this._delete) this._delete = new PerscomDelete(this)
    return this._delete
  }

  invalidateCache(endpoint: string): void {
    const resource = endpoint.split('/')[1];
    Object.keys(sharedCache).forEach(key => {
      if (key.includes(resource)) delete sharedCache[key];
    });
  }

  async fetch<T>(endpoint: string, options: RequestInit): Promise<T> {
    const method = options.method || 'GET';
    const requestKey = `${method}:${endpoint}:${options.body || ''}`;

    if (method === 'GET' && this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    const executeRequest = async (retries = 2): Promise<T> => {
      try {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        // if (!response.ok) {
        //   if (retries > 0 && response.status >= 500) {
        //     await new Promise(r => setTimeout(r, 1000 * (3 - retries)));
        //     return executeRequest(retries - 1);
        //   }
        //   throw new Error(`Perscom API error: ${response.status}`);
        // }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));

          console.error("Perscom API error details:", {
            status: response.status,
            url: `${this.apiUrl}${endpoint}`,
            method,
            body: options.body,
            errorBody,
          });

          if (retries > 0 && response.status >= 500) {
            await new Promise(r => setTimeout(r, 1000 * (3 - retries)));
            return executeRequest(retries - 1);
          }

          throw new Error(`Perscom API error: ${response.status} - ${JSON.stringify(errorBody)}`);
        }

        if (method !== 'GET') {
          this.invalidateCache(endpoint);
        }

        return response.json();
      } catch (error) {
        if (retries > 0 && error instanceof TypeError) {
          await new Promise(r => setTimeout(r, 1000));
          return executeRequest(retries - 1);
        }
        throw error;
      }
    };

    const promise = executeRequest();

    if (method === 'GET') {
      this.pendingRequests.set(requestKey, promise);
      promise.finally(() => {
        this.pendingRequests.delete(requestKey);
      });
    }

    return promise;
  }
}
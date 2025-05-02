import type { PerscomUserResponse } from '@/types/perscomApi'
import type { PerscomClient } from './PerscomClient'

export class PerscomPatch {
  constructor(private client: PerscomClient) {}

  async userApproval(userId: number, approved: boolean, name: string, email: string): Promise<PerscomUserResponse> {
    return this.client.fetch<PerscomUserResponse>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name,
        email,
        approved
      })
    })
  }



}
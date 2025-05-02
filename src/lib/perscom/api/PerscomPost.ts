import type {
  ApplicationSubmission,
  ApplicationSubmissionResponse,
  CreatePerscomUser,
  PerscomUserResponse
} from '@/types/perscomApi'
import type { PerscomClient } from './PerscomClient'

export class PerscomPost {
  constructor(private client: PerscomClient) {}

  async user(data: CreatePerscomUser): Promise<PerscomUserResponse> {
    return this.client.fetch<PerscomUserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async applicationSubmission(data: ApplicationSubmission): Promise<ApplicationSubmissionResponse> {
    return this.client.fetch<ApplicationSubmissionResponse>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async submissionStatus(applicationId: number, status: 'Denied' | 'Accepted'): Promise<void> {
    const statusId = status === 'Denied' ? 8 : 7;
    return this.client.fetch<void>(`/submissions/${applicationId}/statuses/attach`, {
      method: 'POST',
      body: JSON.stringify({
        resources: {
          [statusId]: {}
        }
      })
    })
  }
}
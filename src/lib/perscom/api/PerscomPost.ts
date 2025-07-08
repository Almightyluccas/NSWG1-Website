import {
  ApplicationSubmission,
  ApplicationSubmissionResponse, CreateAssignmentRecord, CreateAwardRecord, CreateCombatRecord,
  CreatePerscomUser, CreateQualificationRecord, CreateRankRecord, PerscomUserCreationResponse,
} from '@/types/perscomApi'
import type { PerscomClient } from './PerscomClient'

export class PerscomPost {
  constructor(private client: PerscomClient) {}

  async user(data: CreatePerscomUser): Promise<PerscomUserCreationResponse> {
    return this.client.fetch<PerscomUserCreationResponse>('/users', {
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

  async userAward(data: CreateAwardRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/award-records`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async clearPerscomCache(): Promise<void> {
    return this.client.fetch<void>(`/cache`, {
      method: 'POST',
    })
  }

  async userCombatRecord(data: CreateCombatRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/combat-records`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async userRankRecord(data: CreateRankRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/rank-records`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async userAssignment(data: CreateAssignmentRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/assignment-records`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async userQualification(data: CreateQualificationRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/qualification-records`, {
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
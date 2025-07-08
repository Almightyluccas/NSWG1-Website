import type {
  ApplicationSubmission,
  ApplicationSubmissionResponse,
  CreateAssignmentRecord,
  CreateAwardRecord,
  CreateCombatRecord,
  CreatePerscomUser,
  CreateQualificationRecord,
  CreateRankRecord,
  PerscomUserCreationResponse,
} from "@/types/perscomApi"
import type { PerscomClient } from "./PerscomClient"
import type { LOASubmission } from "@/types/forms"

export class PerscomPost {
  constructor(private client: PerscomClient) {}

  async user(data: CreatePerscomUser): Promise<PerscomUserCreationResponse> {
    return this.client.fetch<PerscomUserCreationResponse>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async applicationSubmission(data: ApplicationSubmission): Promise<ApplicationSubmissionResponse> {
    return this.client.fetch<ApplicationSubmissionResponse>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async userAward(data: CreateAwardRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/award-records`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async clearPerscomCache(): Promise<void> {
    return this.client.fetch<void>(`/cache`, {
      method: "POST",
    })
  }

  async userCombatRecord(data: CreateCombatRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/combat-records`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async userRankRecord(data: CreateRankRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/rank-records`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async userAssignment(data: CreateAssignmentRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/assignment-records`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async userQualification(data: CreateQualificationRecord): Promise<void> {
    return this.client.fetch<void>(`/users/${data.user_id}/qualification-records`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async submissionStatus(applicationId: number, status: "Denied" | "Accepted"): Promise<void> {
    const statusId = status === "Denied" ? 8 : 7
    return this.client.fetch<void>(`/submissions/${applicationId}/statuses/attach`, {
      method: "POST",
      body: JSON.stringify({
        resources: {
          [statusId]: {},
        },
      }),
    })
  }

  // LOA submission method - you can implement the actual API call later
  async loaSubmission(data: LOASubmission & { user_id: number }): Promise<void> {
    // TODO: Implement the actual Perscom API call for LOA submissions
    // This is a placeholder method that you can fill in with the actual API endpoint
    console.log("LOA Submission data:", data)

    // Example structure for when you implement it:
    // return this.client.fetch<void>('/loa-submissions', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     user_id: data.user_id,
    //     name: data.name,
    //     reason: data.reason,
    //     date_of_leave: data.dateOfLeave || null,
    //     date_of_return: data.dateOfReturn || null,
    //     submitted_at: new Date().toISOString()
    //   })
    // })

    // For now, just return a resolved promise
    return Promise.resolve()
  }
}

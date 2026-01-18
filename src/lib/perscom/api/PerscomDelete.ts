import type { PerscomClient } from './PerscomClient';

export class PerscomDelete {

  constructor(private client: PerscomClient) {}


  private async deleteResource<T = any>(endpoint: string, id: number | string): Promise<T> {
    try {
      const response = await this.client.fetch<T>(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete resource from ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  async user(userId: number): Promise<any> {
    return this.deleteResource('/users', userId);
  }

  async application(submissionId: number): Promise<any> {
    return this.deleteResource('/submissions', submissionId);
  }

  async rank(rankId: number): Promise<any> {
    return this.deleteResource('/ranks', rankId);
  }

  async unit(unitId: number): Promise<any> {
    return this.deleteResource('/units', unitId);
  }

  async position(positionId: number): Promise<any> {
    return this.deleteResource('/positions', positionId);
  }

  async award(awardId: number): Promise<any> {
    return this.deleteResource('/awards', awardId);
  }


  async combatRecord(recordId: number): Promise<any> {
    return this.deleteResource('/combat-records', recordId);
  }

  async assignment(recordId: number): Promise<any> {
    return this.deleteResource('/assignment-records', recordId);
  }

  async qualification(qualificationId: number): Promise<any> {
    return this.deleteResource('/qualifications', qualificationId);
  }
}

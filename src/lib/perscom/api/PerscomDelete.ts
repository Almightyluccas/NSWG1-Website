import type { PerscomClient } from './PerscomClient';

export class PerscomDelete {
  /**
   * @param client The PerscomClient instance for making API requests and managing cache.
   */
  constructor(private client: PerscomClient) {}

  /**
   * A generic private method to handle deleting any resource by its ID.
   * After a successful deletion, it invalidates the cache for that endpoint.
   * @param endpoint The API endpoint (e.g., '/users').
   * @param id The ID of the resource to delete.
   * @returns The JSON response from the API.
   */
  private async deleteResource<T = any>(endpoint: string, id: number | string): Promise<T> {
    try {
      const response = await this.client.fetch<T>(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      this.client.invalidateCache(endpoint);
      console.log(`Successfully deleted resource from ${endpoint}/${id} and invalidated cache.`);

      return response;
    } catch (error) {
      console.error(`Failed to delete resource from ${endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a user by their ID.
   * @param userId The ID of the user to delete.
   */
  async user(userId: number): Promise<any> {
    return this.deleteResource('/users', userId);
  }

  /**
   * Deletes an application submission by its ID.
   * @param submissionId The ID of the application submission to delete.
   */
  async application(submissionId: number): Promise<any> {
    return this.deleteResource('/submissions', submissionId);
  }

  /**
   * Deletes a rank by its ID.
   * @param rankId The ID of the rank to delete.
   */
  async rank(rankId: number): Promise<any> {
    return this.deleteResource('/ranks', rankId);
  }

  /**
   * Deletes a unit by its ID.
   * @param unitId The ID of the unit to delete.
   */
  async unit(unitId: number): Promise<any> {
    return this.deleteResource('/units', unitId);
  }

  /**
   * Deletes a position by its ID.
   * @param positionId The ID of the position to delete.
   */
  async position(positionId: number): Promise<any> {
    return this.deleteResource('/positions', positionId);
  }

  /**
   * Deletes an award by its ID.
   * @param awardId The ID of the award to delete.
   */
  async award(awardId: number): Promise<any> {
    return this.deleteResource('/awards', awardId);
  }

  /**
   * Deletes a combat record by its ID.
   * @param recordId The ID of the combat record to delete.
   */
  async combatRecord(recordId: number): Promise<any> {
    return this.deleteResource('/combat-records', recordId);
  }

  /**
   * Deletes an assignment record by its ID.
   * @param recordId The ID of the assignment record to delete.
   */
  async assignment(recordId: number): Promise<any> {
    return this.deleteResource('/assignment-records', recordId);
  }

  /**
   * Deletes a qualification by its ID.
   * @param qualificationId The ID of the qualification to delete.
   */
  async qualification(qualificationId: number): Promise<any> {
    return this.deleteResource('/qualifications', qualificationId);
  }
}
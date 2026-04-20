import type { DatabaseClient } from "./DatabaseClient";

export class DatabaseDelete {
  constructor(private client: DatabaseClient) {}

  async recurringTraining(recurringId: string): Promise<void> {
    await this.client.query(`DELETE FROM recurring_trainings WHERE id = ?`, [
      recurringId,
    ]);
  }

  async recurringTrainingInstances(recurringId: string): Promise<void> {
    await this.client.query(
      `DELETE FROM recurring_training_instances WHERE recurring_training_id = ?`,
      [recurringId]
    );
  }

  async campaign(campaignId: string): Promise<void> {
    await this.client.query(
      `DELETE mr FROM mission_rsvps mr JOIN missions m ON mr.mission_id = m.id WHERE m.campaign_id = ?`,
      [campaignId]
    );
    await this.client.query(`DELETE FROM missions WHERE campaign_id = ?`, [
      campaignId,
    ]);
    await this.client.query(`DELETE FROM campaigns WHERE id = ?`, [campaignId]);
  }

  async mission(missionId: string): Promise<void> {
    await this.client.query(`DELETE FROM mission_rsvps WHERE mission_id = ?`, [
      missionId,
    ]);
    await this.client.query(`DELETE FROM missions WHERE id = ?`, [missionId]);
  }

  async trainingRecord(trainingId: string): Promise<void> {
    await this.client.query(
      `DELETE FROM training_rsvps WHERE training_id = ?`,
      [trainingId]
    );
    await this.client.query(`DELETE FROM training_records WHERE id = ?`, [
      trainingId,
    ]);
  }

  async deleteFormQuestionsByFormId(formId: number): Promise<void> {
    await this.client.query(`DELETE FROM form_questions WHERE form_id = ?`, [
      formId,
    ]);
  }

  // ── Alerts ──

  async alert(alertId: number): Promise<void> {
    await this.client.query(`DELETE FROM alerts WHERE id = ?`, [alertId]);
  }

  // ── SSE Items ──

  async sseItem(sseItemId: number): Promise<void> {
    await this.client.query(`DELETE FROM sse_items WHERE id = ?`, [sseItemId]);
  }

  // ── Directives ──

  async directive(directiveId: number): Promise<void> {
    await this.client.query(`DELETE FROM directives WHERE id = ?`, [
      directiveId,
    ]);
  }

  // ── Operation Documents ──

  async operationDocument(docId: number): Promise<void> {
    await this.client.query(`DELETE FROM operation_documents WHERE id = ?`, [
      docId,
    ]);
  }

  // ── Operation Intel ──

  async operationIntel(intelId: number): Promise<void> {
    await this.client.query(`DELETE FROM operation_intel WHERE id = ?`, [
      intelId,
    ]);
  }

  // ── After Action Reports ──

  async afterActionReport(aarId: number): Promise<void> {
    await this.client.query(`DELETE FROM after_action_reports WHERE id = ?`, [
      aarId,
    ]);
  }
}

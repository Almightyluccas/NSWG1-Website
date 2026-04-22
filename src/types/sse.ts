// ── SSE types (DB-backed) ──

export interface SseItem {
  id: number;
  campaign_id: string;
  campaign_name?: string;
  type: "DOCUMENT" | "ELECTRONICS" | "WEAPONS" | "MEDIA" | "BIOMETRICS" | "OTHER";
  name: string;
  description: string;
  status: "LOGGED" | "ANALYZING" | "LOCKED" | "RELEASED";
  minimum_role: string;
  image_url: string | null;
  uploaded_by: string;
  uploader_name?: string;
  created_at: string;
  updated_at: string;
}

// ── UI config types (unchanged) ──

export interface SseCategoryConfig {
  key: string;
  label: string;
  iconName: string;
  iconColor: string;
  sortOrder: number;
}

export interface SseStatusConfig {
  key: string;
  label: string;
  text: string;
  sortOrder: number;
}

// Backward-compatible alias for existing frontend components
export type MockSseItem = SseItem;

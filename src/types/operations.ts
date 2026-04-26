// ── Operation types (DB-backed) ──

export interface OperationCampaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  // Op-specific fields
  codename: string | null;
  minimum_role: string;
  ao: string | null;
  brief: string | null;
  commander: string | null;
  force_comp: string | null;
  mission_type: string | null;
  cover_image_url: string | null;
  // Aggregated counts
  mission_count?: number;
  personnel_count?: number;
  // Nested data (populated on detail endpoint)
  missions?: OperationMission[];
  documents?: OperationDocument[];
  intel?: OperationIntel[];
  sse_items?: SseItemSummary[];
  after_action_reports?: AfterActionReport[];
}

export interface AfterActionReport {
  id: number;
  campaign_id: string;
  campaign_name?: string;
  mission_id: string | null;
  mission_name?: string;
  title: string;
  summary: string;
  key_outcomes: string | null;
  lessons_learned: string | null;
  submitted_by: string;
  submitter_name?: string;
  status: "draft" | "submitted" | "reviewed";
  reviewed_by: string | null;
  reviewer_name?: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationMission {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_personnel: number | null;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  created_by: string;
  rsvps?: OperationRSVP[];
  attendance?: OperationAttendance[];
  documents?: OperationDocument[];
}

export interface OperationRSVP {
  id: string;
  user_id: string;
  user_name: string;
  status: "attending" | "not-attending" | "maybe";
  notes: string | null;
  created_at: string;
}

export interface OperationAttendance {
  id: string;
  user_id: string;
  user_name: string;
  status: "present" | "absent" | "late" | "excused";
  notes: string | null;
  marked_by: string;
  marked_by_name: string;
  marked_at: string;
}

export interface OperationDocument {
  id: number;
  campaign_id: string;
  mission_id: string | null;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: string | null;
  minimum_role: string;
  uploaded_by: string;
  uploader_name?: string;
  created_at: string;
}

export interface OperationIntel {
  id: number;
  campaign_id: string;
  type: "image" | "regional" | "operational";
  title: string;
  description: string | null;
  image_url: string | null;
  minimum_role: string;
  created_by: string;
  creator_name?: string;
  created_at: string;
}

export interface SseItemSummary {
  id: number;
  type: string;
  name: string;
  status: string;
}

// ── UI config types (unchanged) ──

export interface ClassificationConfig {
  key: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  strip: string;
  sortOrder: number;
}

export interface OpStatusConfig {
  key: string;
  label: string;
  tabLabel: string;
  barColor: string;
  text: string;
  pulse: boolean;
  sortOrder: number;
}

// Backward-compatible aliases for existing frontend components
export type MockOperation = OperationCampaign;
export type MockPersonnel = OperationRSVP;

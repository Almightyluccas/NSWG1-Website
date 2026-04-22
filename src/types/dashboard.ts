export type AlertSource = "system" | "perscom";

export interface AlertItem {
  id: number;
  /** system = dashboard alerts; perscom = webhook feed for that member */
  source?: AlertSource;
  /** Set when source is perscom (webhook event name). */
  event?: string | null;
  /**
   * Perscom rows: false when an admin is viewing the global feed (cannot dismiss others' items).
   */
  dismissible?: boolean;
  type: "priority" | "info" | "warning";
  label: string;
  message: string;
  target_roles: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_by: string;
  creator_name?: string;
  created_at: string;
}

export interface DirectiveItem {
  id: number;
  label: string;
  description: string | null;
  user_id: string;
  user_name?: string;
  assigned_by: string;
  assigner_name?: string;
  status: "pending" | "done";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

import type { UserRole } from "@/types/database";

export type DocumentClassification =
  | "GENERAL"
  | "UNIT_CONFIDENTIAL"
  | "SECRET"
  | "TOP_SECRET"
  | "LEADERSHIP"
  | "GREEN_TEAM";

export interface DocumentItem {
  id: string;
  name: string;
  classification: DocumentClassification;
  unit: string;
  type: string;
  size: string;
  lastModified: string;
  author: string;
  description: string;
  docNumber: string;
  path?: string;
  /** Lightweight image thumbnail for document listing cards. */
  previewPath?: string;
  minimumRole?: UserRole;
  /** Optional PERSCOM `rank.order` minimum to view (inclusive). */
  minimumRankOrder?: number;
}

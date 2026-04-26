import { ClassificationConfig, OpStatusConfig } from "@/types/operations";
import { SseCategoryConfig, SseStatusConfig } from "@/types/sse";
import { UserRole } from "@/types/database";

// ─────────────────────────────────────────────────────────
//  CLASSIFICATION LEVELS
// ─────────────────────────────────────────────────────────

export const CLASSIFICATIONS: ClassificationConfig[] = [
  {
    key: "UNCLASSIFIED",
    label: "UNCLASSIFIED",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    strip: "bg-emerald-500",
    sortOrder: 0,
  },
  {
    key: "CONFIDENTIAL",
    label: "CONFIDENTIAL",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/40",
    strip: "bg-blue-500",
    sortOrder: 1,
  },
  {
    key: "SECRET",
    label: "SECRET",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/40",
    strip: "bg-amber-500",
    sortOrder: 2,
  },
  {
    key: "TOP_SECRET",
    label: "TOP SECRET",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/40",
    strip: "bg-red-500",
    sortOrder: 3,
  },
  {
    key: "TS_SCI",
    label: "TS/SCI",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/40",
    strip: "bg-purple-500",
    sortOrder: 4,
  },
];

export const CLASSIFICATION_MAP: Record<string, ClassificationConfig> =
  Object.fromEntries(CLASSIFICATIONS.map((c) => [c.key, c]));

export const DEFAULT_CLASSIFICATION: ClassificationConfig = CLASSIFICATIONS[0];

export function getClassification(key: string): ClassificationConfig {
  return CLASSIFICATION_MAP[key] ?? DEFAULT_CLASSIFICATION;
}

// ─────────────────────────────────────────────────────────
//  OPERATION STATUSES
// ─────────────────────────────────────────────────────────

export const OP_STATUSES: OpStatusConfig[] = [
  {
    key: "planning",
    label: "PLANNING",
    tabLabel: "PLANNING / UPCOMING",
    barColor: "bg-amber-500/60",
    text: "text-amber-400",
    pulse: false,
    sortOrder: 0,
  },
  {
    key: "active",
    label: "ACTIVE",
    tabLabel: "ACTIVE OPERATIONS",
    barColor: "bg-accent shadow-[0_0_10px_rgba(var(--accent),0.8)]",
    text: "text-accent",
    pulse: true,
    sortOrder: 1,
  },
  {
    key: "completed",
    label: "COMPLETED",
    tabLabel: "PAST OPERATIONS",
    barColor: "bg-zinc-600",
    text: "text-zinc-400",
    pulse: false,
    sortOrder: 2,
  },
];

export const OP_STATUS_MAP: Record<string, OpStatusConfig> = Object.fromEntries(
  OP_STATUSES.map((s) => [s.key, s])
);

export function getOpStatus(key: string): OpStatusConfig {
  return OP_STATUS_MAP[key] ?? OP_STATUSES[0];
}

// ─────────────────────────────────────────────────────────
//  SSE CATEGORIES
// ─────────────────────────────────────────────────────────

export const SSE_CATEGORIES: SseCategoryConfig[] = [
  {
    key: "DOCUMENT",
    label: "DOCUMENT",
    iconName: "FileText",
    iconColor: "text-emerald-400",
    sortOrder: 0,
  },
  {
    key: "MEDIA",
    label: "MEDIA",
    iconName: "Terminal",
    iconColor: "text-cyan-400",
    sortOrder: 1,
  },
  {
    key: "WEAPONS",
    label: "WEAPONS",
    iconName: "Target",
    iconColor: "text-amber-400",
    sortOrder: 2,
  },
  {
    key: "ELECTRONICS",
    label: "ELECTRONICS",
    iconName: "Zap",
    iconColor: "text-purple-400",
    sortOrder: 3,
  },
  {
    key: "BIOMETRICS",
    label: "BIOMETRICS",
    iconName: "Fingerprint",
    iconColor: "text-blue-400",
    sortOrder: 4,
  },
  {
    key: "OTHER",
    label: "OTHER",
    iconName: "Box",
    iconColor: "text-zinc-400",
    sortOrder: 5,
  },
];

export const SSE_CATEGORY_MAP: Record<string, SseCategoryConfig> =
  Object.fromEntries(SSE_CATEGORIES.map((c) => [c.key, c]));

// ─────────────────────────────────────────────────────────
//  SSE ANALYSIS STATUSES
// ─────────────────────────────────────────────────────────

export const SSE_STATUSES: SseStatusConfig[] = [
  {
    key: "LOGGED",
    label: "LOGGED / PENDING",
    text: "text-zinc-300",
    sortOrder: 0,
  },
  {
    key: "ANALYZING",
    label: "ANALYSIS IN PROGRESS",
    text: "text-amber-400",
    sortOrder: 1,
  },
  {
    key: "RELEASED",
    label: "CLEARED / RELEASED",
    text: "text-emerald-400",
    sortOrder: 2,
  },
  {
    key: "LOCKED",
    label: "LOCKED / SECURED",
    text: "text-red-400",
    sortOrder: 3,
  },
];

export const SSE_STATUS_MAP: Record<string, SseStatusConfig> =
  Object.fromEntries(SSE_STATUSES.map((s) => [s.key, s]));

export function getSseStatus(key: string): SseStatusConfig {
  return SSE_STATUS_MAP[key] ?? SSE_STATUSES[0];
}

// ─────────────────────────────────────────────────────────
//  HELPER: check if a user has clearance to see a name
// ─────────────────────────────────────────────────────────

export function hasMinClearance(
  userClearance: string,
  requiredClearance: string
): boolean {
  const order = CLASSIFICATIONS.map((c) => c.key);
  const userIdx = order.indexOf(userClearance);
  const reqIdx = order.indexOf(requiredClearance);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx >= reqIdx;
}

export function getRedactedName(
  person: { name: string; minimum_role?: string; minClearance?: string },
  viewerClearance: string
): string {
  if (person.name === "[REDACTED]") return "██████████";

  // Either we use the new minimum_role mapping or the old minClearance
  const required = person.minimum_role || person.minClearance || "LEVEL_1";
  if (hasMinClearance(viewerClearance, required)) return person.name;
  return "██████████";
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OPERATIONS CENTER — SHARED CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  This file centralizes ALL configurable values for the Operations Center,
 *  SSE Library, and Documents Center.
 *
 *  To make any of these dynamic (pulled from a DB), simply replace the
 *  hardcoded arrays/records below with async fetches and pass the results
 *  as props to each client component.
 *
 *  Each config object is typed so TypeScript catches missing fields.
 * ═══════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────
//  CLASSIFICATION LEVELS
// ─────────────────────────────────────────────────────────

export interface ClassificationConfig {
  key: string;
  label: string;
  /** Badge / background color class */
  bg: string;
  /** Text color class */
  text: string;
  /** Border color class */
  border: string;
  /** Strip / sidebar accent color */
  strip: string;
  /** Sort order (lower = higher priority) */
  sortOrder: number;
}

export const CLASSIFICATIONS: ClassificationConfig[] = [
  {
    key: "UNCLASSIFIED",
    label: "UNCLASSIFIED",
    bg: "bg-zinc-800/80",
    text: "text-zinc-300",
    border: "border-zinc-600/60",
    strip: "bg-zinc-500",
    sortOrder: 0,
  },
  {
    key: "CONFIDENTIAL",
    label: "CONFIDENTIAL",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    strip: "bg-emerald-500",
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
];

/** Quick lookup by key */
export const CLASSIFICATION_MAP: Record<string, ClassificationConfig> =
  Object.fromEntries(CLASSIFICATIONS.map((c) => [c.key, c]));

/** Fallback when key is unknown */
export const DEFAULT_CLASSIFICATION: ClassificationConfig = CLASSIFICATIONS[0];

export function getClassification(key: string): ClassificationConfig {
  return CLASSIFICATION_MAP[key] ?? DEFAULT_CLASSIFICATION;
}

// ─────────────────────────────────────────────────────────
//  OPERATION STATUSES
// ─────────────────────────────────────────────────────────

export interface OpStatusConfig {
  key: string;
  label: string;
  tabLabel: string;
  /** Color for the left-edge status bar */
  barColor: string;
  /** Text color class */
  text: string;
  /** Whether to show a pulsing dot */
  pulse: boolean;
  sortOrder: number;
}

export const OP_STATUSES: OpStatusConfig[] = [
  {
    key: "ACTIVE",
    label: "ACTIVE",
    tabLabel: "ACTIVE OPERATIONS",
    barColor: "bg-accent shadow-[0_0_10px_rgba(var(--accent),0.8)]",
    text: "text-accent",
    pulse: true,
    sortOrder: 0,
  },
  {
    key: "UPCOMING",
    label: "UPCOMING",
    tabLabel: "UPCOMING / PLANNING",
    barColor: "bg-amber-500/50",
    text: "text-amber-400",
    pulse: false,
    sortOrder: 1,
  },
  {
    key: "COMPLETED",
    label: "COMPLETED",
    tabLabel: "COMPLETED EXECS",
    barColor: "bg-zinc-600",
    text: "text-zinc-400",
    pulse: false,
    sortOrder: 2,
  },
];

export const OP_STATUS_MAP: Record<string, OpStatusConfig> =
  Object.fromEntries(OP_STATUSES.map((s) => [s.key, s]));

export function getOpStatus(key: string): OpStatusConfig {
  return OP_STATUS_MAP[key] ?? OP_STATUSES[0];
}

// ─────────────────────────────────────────────────────────
//  SSE CATEGORIES
// ─────────────────────────────────────────────────────────

export interface SseCategoryConfig {
  key: string;
  label: string;
  /** Lucide icon name (consumer maps this to the component) */
  iconName: string;
  /** Icon color class */
  iconColor: string;
  sortOrder: number;
}

export const SSE_CATEGORIES: SseCategoryConfig[] = [
  { key: "DOCUMENT", label: "DOCUMENT", iconName: "FileText", iconColor: "text-emerald-400", sortOrder: 0 },
  { key: "MEDIA", label: "MEDIA", iconName: "Terminal", iconColor: "text-cyan-400", sortOrder: 1 },
  { key: "WEAPONS", label: "WEAPONS", iconName: "Target", iconColor: "text-amber-400", sortOrder: 2 },
  { key: "ELECTRONICS", label: "ELECTRONICS", iconName: "Zap", iconColor: "text-purple-400", sortOrder: 3 },
  { key: "BIOMETRICS", label: "BIOMETRICS", iconName: "Fingerprint", iconColor: "text-blue-400", sortOrder: 4 },
  { key: "OTHER", label: "OTHER", iconName: "Box", iconColor: "text-zinc-400", sortOrder: 5 },
];

export const SSE_CATEGORY_MAP: Record<string, SseCategoryConfig> =
  Object.fromEntries(SSE_CATEGORIES.map((c) => [c.key, c]));

// ─────────────────────────────────────────────────────────
//  SSE ANALYSIS STATUSES
// ─────────────────────────────────────────────────────────

export interface SseStatusConfig {
  key: string;
  label: string;
  text: string;
  sortOrder: number;
}

export const SSE_STATUSES: SseStatusConfig[] = [
  { key: "LOGGED", label: "LOGGED / PENDING", text: "text-zinc-300", sortOrder: 0 },
  { key: "ANALYZING", label: "ANALYSIS IN PROGRESS", text: "text-amber-400", sortOrder: 1 },
  { key: "RELEASED", label: "CLEARED / RELEASED", text: "text-emerald-400", sortOrder: 2 },
  { key: "LOCKED", label: "LOCKED / SECURED", text: "text-red-400", sortOrder: 3 },
];

export const SSE_STATUS_MAP: Record<string, SseStatusConfig> =
  Object.fromEntries(SSE_STATUSES.map((s) => [s.key, s]));

export function getSseStatus(key: string): SseStatusConfig {
  return SSE_STATUS_MAP[key] ?? SSE_STATUSES[0];
}

// ─────────────────────────────────────────────────────────
//  MOCK OPERATIONS DATA
// ─────────────────────────────────────────────────────────

export interface MockPersonnel {
  name: string;
  role: string;
  /** minimum classification key needed to see this person's real name */
  minClearance: string;
}

export interface MockOperation {
  id: string;
  codename: string;
  status: string;
  classification: string;
  unit: string;
  ao: string;
  dates: string;
  brief: string;
  commander: string;
  forceComp: string;
  missionType: string;
  commsFreq: string;
  personnel: MockPersonnel[];
}

export const MOCK_OPERATIONS: MockOperation[] = [
  // ── ACTIVE ──
  {
    id: "op-trident-fury",
    codename: "OP TRIDENT FURY",
    status: "ACTIVE",
    classification: "TOP_SECRET",
    unit: "Joint Task Force (SEAL Team 2 / TF160)",
    ao: "Kunar Province, AFG",
    dates: "2026-03-15 — PRESENT",
    brief: "High-value target (HVT) extraction and subsequent SSE of hostile leadership compound. Intelligence suggests presence of advanced weaponry and strategic documentation outlining future hostile intents in the region.",
    commander: "CAPT J. Williams",
    forceComp: "ST2 (2x Platoons), TF160 (1x Flight), ISR Support",
    missionType: "Direct Action / SSE",
    commsFreq: "CH-7 SATCOM (Encrypted)",
    personnel: [
      { name: "CAPT J. Williams", role: "Task Force Commander", minClearance: "SECRET" },
      { name: "LCDR R. Hayes", role: "Ground Force Commander", minClearance: "SECRET" },
      { name: "LT M. Chen", role: "Intelligence Officer", minClearance: "TOP_SECRET" },
      { name: "SO1 D. Torres", role: "Team Leader — Alpha", minClearance: "SECRET" },
      { name: "SO2 K. Patel", role: "JTAC / Forward Observer", minClearance: "SECRET" },
      { name: "CW3 S. Baker", role: "Lead Pilot — TF160", minClearance: "CONFIDENTIAL" },
    ],
  },
  {
    id: "op-silent-storm",
    codename: "OP SILENT STORM",
    status: "ACTIVE",
    classification: "SECRET",
    unit: "SEAL Team 2",
    ao: "Gulf of Aden",
    dates: "2026-03-10 — PRESENT",
    brief: "Maritime interception and counter-piracy patrol operations along critical shipping lanes. Task force is conducting VBSS operations on suspect vessels and maintaining presence in the AO.",
    commander: "CDR A. Thompson",
    forceComp: "ST2 (1x Platoon), USS Bataan ARG",
    missionType: "Maritime Interdiction (MIO)",
    commsFreq: "CH-3 HF / SATCOM",
    personnel: [
      { name: "CDR A. Thompson", role: "OIC", minClearance: "CONFIDENTIAL" },
      { name: "LT J. Park", role: "Boarding Team Leader", minClearance: "CONFIDENTIAL" },
      { name: "SO1 R. Nguyen", role: "Sniper / Overwatch", minClearance: "SECRET" },
      { name: "SB1 F. Adams", role: "SWCC Boat Captain", minClearance: "CONFIDENTIAL" },
    ],
  },
  {
    id: "op-phantom-eagle",
    codename: "OP PHANTOM EAGLE",
    status: "ACTIVE",
    classification: "TOP_SECRET",
    unit: "TACDEVRON 2 / CIA SAD",
    ao: "Undisclosed — Central Asia",
    dates: "2026-02-28 — PRESENT",
    brief: "Joint special activities operation supporting agency objectives in a denied area. Tasked with ISR collection, network exploitation, and advisory support to partner forces.",
    commander: "CAPT (SEL) M. Ortiz",
    forceComp: "TDR2 (1x Det), CIA Ground Branch (1x Team)",
    missionType: "Special Reconnaissance / FID",
    commsFreq: "COVERT — NEED TO KNOW",
    personnel: [
      { name: "CAPT (SEL) M. Ortiz", role: "Detachment OIC", minClearance: "TOP_SECRET" },
      { name: "SO1 G. Ivanov", role: "Senior Enlisted Advisor", minClearance: "TOP_SECRET" },
      { name: "[REDACTED]", role: "Agency Liaison", minClearance: "TOP_SECRET" },
    ],
  },
  // ── UPCOMING ──
  {
    id: "op-iron-shield",
    codename: "OP IRON SHIELD",
    status: "UPCOMING",
    classification: "CONFIDENTIAL",
    unit: "NSWG1 HQ",
    ao: "Fort Story, VA",
    dates: "2026-04-05 — 2026-04-12",
    brief: "Joint readiness and coastal defense Field Training Exercise (FTX). All NSWG1 elements will participate in a full-spectrum exercise including maritime, littoral, and inland operations.",
    commander: "RDML P. Connors",
    forceComp: "NSWG1 (All Elements), USMC 2nd RECON Bn",
    missionType: "FTX / Joint Exercise",
    commsFreq: "Exercise Net CHARLIE",
    personnel: [
      { name: "RDML P. Connors", role: "Exercise Director", minClearance: "UNCLASSIFIED" },
      { name: "CAPT J. Williams", role: "NSWG1 Lead", minClearance: "UNCLASSIFIED" },
    ],
  },
  {
    id: "op-midnight-sun",
    codename: "OP MIDNIGHT SUN",
    status: "UPCOMING",
    classification: "SECRET",
    unit: "TACDEVRON 2",
    ao: "Barents Sea, NOR",
    dates: "2026-04-20 — TBD",
    brief: "Subsurface infiltration testing and cold-weather equipment validation. TACDEVRON 2 will conduct SDV operations and evaluate next-generation thermal protection gear in arctic maritime conditions.",
    commander: "CDR N. Nakamura",
    forceComp: "TDR2 (2x SDV Teams), Norwegian MJK (Observer)",
    missionType: "Developmental Test & Evaluation",
    commsFreq: "SATCOM Bravo-9",
    personnel: [
      { name: "CDR N. Nakamura", role: "Mission Commander", minClearance: "CONFIDENTIAL" },
      { name: "LT H. Svensson", role: "Norwegian Liaison", minClearance: "CONFIDENTIAL" },
    ],
  },
  {
    id: "op-neptune-reach",
    codename: "OP NEPTUNE REACH",
    status: "UPCOMING",
    classification: "CONFIDENTIAL",
    unit: "SEAL Team 2 / Task Force 160th",
    ao: "Camp Lejeune, NC",
    dates: "2026-05-01 — 2026-05-07",
    brief: "Multi-phase amphibious assault training with rotary-wing integration. Focus: beach insertion, FARP establishment, and nighttime helicopter assault operations.",
    commander: "CDR R. Hayes",
    forceComp: "ST2 (1x Platoon), TF160 (2x Flights)",
    missionType: "Amphibious Assault Training",
    commsFreq: "TacNet Alpha-4",
    personnel: [
      { name: "CDR R. Hayes", role: "Exercise OIC", minClearance: "UNCLASSIFIED" },
      { name: "MAJ L. Collins", role: "TF160 Flight Lead", minClearance: "UNCLASSIFIED" },
    ],
  },
  // ── COMPLETED ──
  {
    id: "op-desert-strike",
    codename: "OP DESERT STRIKE",
    status: "COMPLETED",
    classification: "SECRET",
    unit: "Task Force 160th",
    ao: "Al Anbar, IRQ",
    dates: "2025-11-10 — 2025-11-14",
    brief: "Nighttime rotary-wing strike on known weapons cache. 100% destruction of target achieved with zero friendly casualties. Post-strike SSE yielded significant intelligence materials.",
    commander: "LTC S. Adams",
    forceComp: "TF160 (2x AH-64, 2x MH-60), ST2 QRF",
    missionType: "Strike / SSE",
    commsFreq: "Strike Net Alpha",
    personnel: [
      { name: "LTC S. Adams", role: "Strike Package Commander", minClearance: "CONFIDENTIAL" },
      { name: "CW4 J. Rodriguez", role: "Lead Pilot", minClearance: "CONFIDENTIAL" },
      { name: "SO1 B. Kim", role: "QRF Team Leader", minClearance: "SECRET" },
    ],
  },
  {
    id: "op-crimson-tide",
    codename: "OP CRIMSON TIDE",
    status: "COMPLETED",
    classification: "UNCLASSIFIED",
    unit: "SEAL Team 2",
    ao: "San Diego, CA",
    dates: "2025-08-01 — 2025-08-15",
    brief: "BUD/S Phase 3 interoperability and fleet training support. SEAL Team 2 operators provided mentorship and direct training supervision for advanced tactics qualification.",
    commander: "LCDR T. Brooks",
    forceComp: "ST2 (Instructor Cadre), BUD/S Class 365",
    missionType: "Training / FTX",
    commsFreq: "N/A (Training)",
    personnel: [
      { name: "LCDR T. Brooks", role: "Training OIC", minClearance: "UNCLASSIFIED" },
      { name: "SO1 M. Rivera", role: "Lead Instructor", minClearance: "UNCLASSIFIED" },
    ],
  },
  {
    id: "op-viper-strike",
    codename: "OP VIPER STRIKE",
    status: "COMPLETED",
    classification: "TOP_SECRET",
    unit: "Joint Task Force (ST2 / CIA)",
    ao: "Helmand Province, AFG",
    dates: "2025-06-12 — 2025-06-18",
    brief: "Targeted kill/capture mission against a senior Taliban commander in the Helmand river valley. Operation resulted in successful capture of HVT and recovery of extensive communications equipment.",
    commander: "CDR A. Thompson",
    forceComp: "ST2 (1x Platoon), CIA PMO, ISR (MQ-9)",
    missionType: "Direct Action / HVT",
    commsFreq: "COVERT — CLASSIFIED",
    personnel: [
      { name: "CDR A. Thompson", role: "Task Force Commander", minClearance: "SECRET" },
      { name: "LT K. Wallace", role: "Ground Force Commander", minClearance: "TOP_SECRET" },
      { name: "[REDACTED]", role: "Agency Case Officer", minClearance: "TOP_SECRET" },
      { name: "SO1 R. Nguyen", role: "Lead Breacher", minClearance: "SECRET" },
    ],
  },
  {
    id: "op-shadow-lance",
    codename: "OP SHADOW LANCE",
    status: "COMPLETED",
    classification: "SECRET",
    unit: "TACDEVRON 2",
    ao: "Philippine Sea",
    dates: "2025-03-20 — 2025-04-02",
    brief: "Combat swimmer and SDV operations in the Western Pacific in support of INDOPACOM freedom of navigation objectives. Successfully tested new long-range SDV mission profiles.",
    commander: "CDR N. Nakamura",
    forceComp: "TDR2 (1x SDV Team), USS Ohio SSGN",
    missionType: "Special Reconnaissance",
    commsFreq: "Sub-comms ULF Net",
    personnel: [
      { name: "CDR N. Nakamura", role: "Mission Commander", minClearance: "CONFIDENTIAL" },
      { name: "LT D. Tanaka", role: "SDV Pilot", minClearance: "SECRET" },
    ],
  },
];

// ─────────────────────────────────────────────────────────
//  MOCK SSE DATA
// ─────────────────────────────────────────────────────────

export interface MockSseItem {
  id: string;
  op: string;
  type: string;
  name: string;
  date: string;
  status: string;
  classification: string;
  uploader: string;
  description: string;
}

export const MOCK_SSE: MockSseItem[] = [
  { id: "sse-001", op: "OP TRIDENT FURY", type: "DOCUMENT", name: "Hostile Route Maps", date: "2026-03-16", status: "ANALYZING", classification: "SECRET", uploader: "SO1 D. Torres", description: "Recovered physical maps from the compound showing extensive egress routes through the valley. Notes indicate potential ambush points and cache locations. Scanned at 600dpi, awaiting translation." },
  { id: "sse-002", op: "OP TRIDENT FURY", type: "ELECTRONICS", name: "Encrypted Hard Drive", date: "2026-03-16", status: "LOCKED", classification: "TOP_SECRET", uploader: "LT M. Chen", description: "500GB hard drive recovered from hostile commander's quarters. AES-256 encrypted. Transferred to NSA for exploitation." },
  { id: "sse-003", op: "OP TRIDENT FURY", type: "WEAPONS", name: "Weapon Hardware Fragments", date: "2026-03-15", status: "LOGGED", classification: "UNCLASSIFIED", uploader: "SO2 K. Patel", description: "Fragmented IED components and triggering mechanisms collected from blast site. Forwarded to EOD technical analysis." },
  { id: "sse-004", op: "OP DESERT STRIKE", type: "MEDIA", name: "Facility Surveillance Footage", date: "2025-11-13", status: "LOGGED", classification: "SECRET", uploader: "CW4 J. Rodriguez", description: "MQ-9 Reaper ISR footage covering 48hrs pre-strike and post-strike battle damage assessment. HD format." },
  { id: "sse-005", op: "OP DESERT STRIKE", type: "BIOMETRICS", name: "Unknown Fingerprint Matches", date: "2025-11-13", status: "ANALYZING", classification: "UNCLASSIFIED", uploader: "SO1 B. Kim", description: "Latent fingerprint samples collected from seized weaponry. Three partial matches pending ABIS database verification." },
  { id: "sse-006", op: "OP SILENT STORM", type: "ELECTRONICS", name: "Seized Comms Relay", date: "2026-03-11", status: "LOCKED", classification: "SECRET", uploader: "LT J. Park", description: "VHF/UHF relay station with custom firmware recovered from suspect vessel. Electronics intact." },
  { id: "sse-007", op: "OP SILENT STORM", type: "OTHER", name: "Unidentified Chemical Samples", date: "2026-03-10", status: "LOGGED", classification: "SECRET", uploader: "SO1 R. Nguyen", description: "Three vials of unknown liquid chemical compound collected from vessel cargo hold. Shipped to CBRN lab for analysis." },
  { id: "sse-008", op: "OP VIPER STRIKE", type: "DOCUMENT", name: "Taliban Comms Ledger", date: "2025-06-18", status: "RELEASED", classification: "SECRET", uploader: "LT K. Wallace", description: "Handwritten ledger detailing courier network frequencies, dead drops, and contact schedules across Helmand Province." },
  { id: "sse-009", op: "OP VIPER STRIKE", type: "ELECTRONICS", name: "Recovered Satellite Phone", date: "2025-06-17", status: "RELEASED", classification: "TOP_SECRET", uploader: "SO1 R. Nguyen", description: "Thuraya satellite handset with intact SIM. Call logs and SMS messages extracted for SIGINT analysis." },
];

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
  person: MockPersonnel,
  viewerClearance: string
): string {
  if (person.name === "[REDACTED]") return "██████████";
  if (hasMinClearance(viewerClearance, person.minClearance)) return person.name;
  return "██████████";
}

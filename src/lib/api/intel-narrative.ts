/** Merge regional + operational operation_intel rows for IntelBlockForm API responses. */
export function mergeIntelNarrativeRows(
  rows: Array<{
    type: string;
    description: string | null;
    created_by: string;
    created_at: Date | string;
    updated_at?: Date | string | null;
  }>,
  idKey: "campaignId" | "missionId",
  id: string
): {
  campaignId?: string;
  missionId?: string;
  regionalIntel: string;
  operationalIntel: string;
  updatedAt: string;
  updatedBy: string;
} {
  const regional = rows.find((r) => r.type === "regional");
  const operational = rows.find((r) => r.type === "operational");
  const stamps = rows
    .map((r) => new Date((r.updated_at || r.created_at) as string).getTime())
    .filter((t) => !Number.isNaN(t));
  const updatedAt = stamps.length ? new Date(Math.max(...stamps)).toISOString() : "";
  const updatedBy = (operational?.created_by || regional?.created_by || "") as string;

  const base = {
    regionalIntel: regional?.description ?? "",
    operationalIntel: operational?.description ?? "",
    updatedAt,
    updatedBy,
  };

  if (idKey === "campaignId") {
    return { campaignId: id, ...base };
  }
  return { missionId: id, ...base };
}

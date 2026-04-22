/** Shape expected by SseAttachmentList / operation-detail management SSE cards. */
export function mapSseRowForManagement(row: {
  id: number;
  name: string;
  description: string | null;
  type: string;
  classification?: string | null;
  status: string;
  image_url?: string | null;
  collected_date?: Date | string | null;
}) {
  const collected =
    row.collected_date == null
      ? ""
      : typeof row.collected_date === "string"
        ? row.collected_date.slice(0, 10)
        : new Date(row.collected_date).toISOString().slice(0, 10);

  return {
    id: String(row.id),
    title: row.name,
    description: row.description ?? "",
    type: row.type,
    classification: row.classification ?? "",
    status: row.status,
    imageUrl: row.image_url ?? "",
    collectedDate: collected,
  };
}

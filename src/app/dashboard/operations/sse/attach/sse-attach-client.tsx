"use client";

import { useEffect, useState } from "react";
import { RepositoryPicker } from "@/components/operations/management/repository-picker";

export function SseAttachClient({
  campaignId,
  missionId,
}: {
  campaignId: string;
  missionId: string;
}) {
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/sse?scope=management&missionId=${missionId}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setAttachedIds(new Set(data.map((x: { id: string }) => String(x.id))));
      }
    }
    void load();
  }, [missionId]);

  return (
    <RepositoryPicker
      title="Attach Existing SSE"
      fetchUrl={`/api/sse?scope=repository&campaignId=${campaignId}`}
      attachUrl={(id) => `/api/sse/${id}/attach`}
      missionId={missionId}
      backHref={`/dashboard/operations/management/campaigns/${campaignId}/missions/${missionId}`}
      alreadyAttachedIds={attachedIds}
      renderItem={(item) => (
        <div>
          <p className="text-sm font-semibold">{String(item.title ?? "")}</p>
          <p className="text-xs text-zinc-500">
            {String(item.description ?? "")}
          </p>
        </div>
      )}
    />
  );
}

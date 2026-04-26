"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { destructiveBtn, primaryBtn, secondaryBtn } from "./action-buttons";

type SseItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  classification: string;
  status: string;
  imageUrl: string;
  collectedDate: string;
};

export function SseSummaryPanel({
  ownerType,
  ownerId,
  campaignId,
  isAdmin,
  heading = "SSE Returns",
}: {
  ownerType: "campaign" | "mission";
  ownerId: string;
  campaignId: string;
  isAdmin: boolean;
  heading?: string;
}) {
  const [items, setItems] = useState<SseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const query =
    ownerType === "campaign"
      ? `scope=management&campaignId=${ownerId}`
      : `scope=management&missionId=${ownerId}`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sse?${query}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, ownerId]);

  const detach = async (sseId: string) => {
    if (ownerType !== "mission") return;
    const res = await fetch(`/api/sse/${sseId}/attach?missionId=${ownerId}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800/70 rounded-xl bg-white dark:bg-zinc-900/50">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/70">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700 dark:text-zinc-300">
            {heading}
          </CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Button asChild className={primaryBtn}>
                <Link
                  href={`/dashboard/operations/sse/upload?campaignId=${campaignId}${ownerType === "mission" ? `&missionId=${ownerId}` : ""}`}
                >
                  Dump SSE
                </Link>
              </Button>
              {ownerType === "mission" && (
                <Button asChild variant="outline" className={secondaryBtn}>
                  <Link
                    href={`/dashboard/operations/sse/attach?campaignId=${campaignId}&missionId=${ownerId}`}
                  >
                    Attach Existing
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {loading ? (
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.16em]">
            Loading SSE...
          </p>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/40">
            No SSE linked.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4 text-accent" />
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {item.type && <Badge variant="outline">{item.type}</Badge>}
                    {item.classification && (
                      <Badge variant="outline">{item.classification}</Badge>
                    )}
                    {item.status && (
                      <Badge variant="outline">{item.status}</Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className={secondaryBtn}>
                      <Link href={`/dashboard/operations/sse/${item.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    {ownerType === "mission" && (
                      <Button
                        type="button"
                        variant="outline"
                        className={destructiveBtn}
                        onClick={() => void detach(item.id)}
                      >
                        Detach
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

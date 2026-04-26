"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { destructiveBtn, primaryBtn, secondaryBtn } from "./action-buttons";

type PlanningDocItem = {
  id: string;
  title: string;
  description: string;
  docType: string;
  classification: string;
  fileUrl: string;
  date: string;
  createdAt: string;
};

export function DocSummaryPanel({
  ownerType,
  ownerId,
  campaignId,
  isAdmin,
  heading = "Docs",
}: {
  ownerType: "campaign" | "mission";
  ownerId: string;
  campaignId: string;
  isAdmin: boolean;
  heading?: string;
}) {
  const [items, setItems] = useState<PlanningDocItem[]>([]);
  const [loading, setLoading] = useState(true);

  const query =
    ownerType === "campaign" ? `campaignId=${ownerId}` : `missionId=${ownerId}`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/docs?${query}`);
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

  const detach = async (docId: string) => {
    if (ownerType !== "mission") return;
    const res = await fetch(`/api/docs/${docId}/attach?missionId=${ownerId}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
  };

  const download = async (docId: string) => {
    const res = await fetch(`/api/docs/${docId}/download`);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
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
                  href={`/dashboard/operations/docs/upload?campaignId=${campaignId}${ownerType === "mission" ? `&missionId=${ownerId}` : ""}`}
                >
                  Upload New
                </Link>
              </Button>
              {ownerType === "mission" && (
                <Button asChild variant="outline" className={secondaryBtn}>
                  <Link
                    href={`/dashboard/operations/docs/attach?campaignId=${campaignId}&missionId=${ownerId}`}
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
            Loading docs...
          </p>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/40">
            No docs linked.
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
                    <FileText className="h-4 w-4 text-accent" />
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {item.docType && (
                      <Badge variant="outline">{item.docType}</Badge>
                    )}
                    {item.classification && (
                      <Badge variant="outline">{item.classification}</Badge>
                    )}
                    {item.date && <Badge variant="outline">{item.date}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={secondaryBtn}
                    onClick={() => void download(item.id)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                  {isAdmin && (
                    <Button asChild variant="outline" className={secondaryBtn}>
                      <Link href={`/dashboard/operations/docs/${item.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  )}
                  {isAdmin && ownerType === "mission" && (
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
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

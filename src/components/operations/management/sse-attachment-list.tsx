"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

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

export function SseAttachmentList({
  ownerType,
  ownerId,
  campaignId,
  heading,
}: {
  ownerType: "campaign" | "mission";
  ownerId: string;
  campaignId?: string;
  heading: string;
}) {
  const [items, setItems] = useState<SseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "EVIDENCE",
    classification: "UNCLASSIFIED",
    status: "LOGGED",
    imageUrl: "",
    collectedDate: "",
  });

  const query =
    ownerType === "campaign"
      ? `scope=management&campaignId=${ownerId}`
      : `scope=management&missionId=${ownerId}`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sse?${query}`);
      if (!res.ok) throw new Error("Failed to load SSE.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, ownerId]);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const payload =
        ownerType === "campaign"
          ? { scope: "management", campaignId: ownerId, ...form }
          : { scope: "management", missionId: ownerId, campaignId, ...form };
      const res = await fetch("/api/sse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add SSE record.");
      setForm({
        title: "",
        description: "",
        type: "EVIDENCE",
        classification: "UNCLASSIFIED",
        status: "LOGGED",
        imageUrl: "",
        collectedDate: "",
      });
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to add SSE record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800/70 rounded-xl bg-white dark:bg-zinc-900/50">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/70">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700 dark:text-zinc-300">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Captured radio handset"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              placeholder="DOCUMENT / MEDIA / EVIDENCE"
            />
          </div>
          <div className="space-y-2">
            <Label>Classification</Label>
            <Input
              value={form.classification}
              onChange={(e) =>
                setForm((p) => ({ ...p, classification: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              placeholder="LOGGED / ANALYZING / LOCKED"
            />
          </div>
          <div className="space-y-2">
            <Label>Collected Date</Label>
            <Input
              type="date"
              value={form.collectedDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, collectedDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL (placeholder)</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="https://placeholder.local/sse-image.jpg"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="min-h-[84px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-red-500">{error}</p>
          <Button
            type="button"
            size="sm"
            className="bg-accent hover:bg-accent-darker text-black"
            onClick={submit}
            disabled={submitting || !form.title}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            Add SSE Return
          </Button>
        </div>

        {loading ? (
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.16em]">
            Loading SSE returns...
          </p>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/40">
            No SSE returns yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-950/40 overflow-hidden"
              >
                <div className="relative aspect-[16/9] w-full bg-zinc-200 dark:bg-zinc-900">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="outline">{item.classification}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                    {item.collectedDate && (
                      <Badge variant="outline">{item.collectedDate}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

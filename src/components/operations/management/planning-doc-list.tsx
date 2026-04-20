"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, FileText } from "lucide-react";

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

export function PlanningDocList({
  ownerType,
  ownerId,
  heading,
}: {
  ownerType: "campaign" | "mission";
  ownerId: string;
  heading: string;
}) {
  const [items, setItems] = useState<PlanningDocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    docType: "CONOP",
    classification: "UNCLASSIFIED",
    fileUrl: "",
    date: "",
  });

  const query = ownerType === "campaign" ? `campaignId=${ownerId}` : `missionId=${ownerId}`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/docs?${query}`);
      if (!res.ok) throw new Error("Failed to load planning docs.");
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
        ownerType === "campaign" ? { campaignId: ownerId, ...form } : { missionId: ownerId, ...form };
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create planning doc.");
      setForm({
        title: "",
        description: "",
        docType: "CONOP",
        classification: "UNCLASSIFIED",
        fileUrl: "",
        date: "",
      });
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to create planning doc.");
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
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="CONOP // Operation Trident"
            />
          </div>
          <div className="space-y-2">
            <Label>Doc Type</Label>
            <Input
              value={form.docType}
              onChange={(e) => setForm((p) => ({ ...p, docType: e.target.value }))}
              placeholder="CONOP / WARNO / FRAGO"
            />
          </div>
          <div className="space-y-2">
            <Label>Classification</Label>
            <Input
              value={form.classification}
              onChange={(e) => setForm((p) => ({ ...p, classification: e.target.value }))}
              placeholder="UNCLASSIFIED / SECRET"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Placeholder File URL</Label>
            <Input
              value={form.fileUrl}
              onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))}
              placeholder="https://placeholder.local/conop.pdf"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
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
            {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Add Planning Doc
          </Button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.16em]">Loading docs...</p>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/40">
              No planning docs yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-950/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent" />
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {item.docType}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                  <Badge variant="outline">{item.classification}</Badge>
                  {item.date && <Badge variant="outline">{item.date}</Badge>}
                  {item.fileUrl && <Badge variant="outline">URL Attached</Badge>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SseEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    campaignId: "",
    title: "",
    type: "",
    classification: "",
    status: "",
    collectedDate: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sse/${id}`);
      const row = await res.json();
      if (res.ok) {
        setForm({
          campaignId: String(row.campaign_id ?? ""),
          title: String(row.name ?? ""),
          type: String(row.type ?? ""),
          classification: String(row.classification ?? ""),
          status: String(row.status ?? ""),
          collectedDate: row.collected_date
            ? String(row.collected_date).slice(0, 10)
            : "",
          description: String(row.description ?? ""),
        });
      }
      setLoading(false);
    }
    void load();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/sse/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push(`/dashboard/operations/${form.campaignId}`);
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading SSE...</p>;

  return (
    <form className="max-w-3xl space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Title"
        />
        <Input
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          placeholder="Type"
        />
        <Input
          value={form.classification}
          onChange={(e) =>
            setForm((p) => ({ ...p, classification: e.target.value }))
          }
          placeholder="Classification"
        />
        <Input
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          placeholder="Status"
        />
        <Input
          type="date"
          value={form.collectedDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, collectedDate: e.target.value }))
          }
        />
      </div>
      <Textarea
        value={form.description}
        onChange={(e) =>
          setForm((p) => ({ ...p, description: e.target.value }))
        }
      />
      <div className="flex gap-2 justify-end">
        <Button asChild variant="outline">
          <Link href={`/dashboard/operations/${form.campaignId}`}>Cancel</Link>
        </Button>
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/80 text-black"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export function IntelBlockForm({
  ownerType,
  ownerId,
  heading,
}: {
  ownerType: "campaign" | "mission";
  ownerId: string;
  heading: string;
}) {
  const [regionalIntel, setRegionalIntel] = useState("");
  const [operationalIntel, setOperationalIntel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const basePath =
    ownerType === "campaign" ? "/api/intel/campaign" : "/api/intel/mission";
  const ownerKey = ownerType === "campaign" ? "campaignId" : "missionId";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${basePath}?${ownerKey}=${ownerId}`);
        if (!res.ok) throw new Error("Failed to load intel.");
        const data = await res.json();
        if (!mounted) return;
        setRegionalIntel(data.regionalIntel ?? "");
        setOperationalIntel(data.operationalIntel ?? "");
      } catch {
        if (!mounted) return;
        setRegionalIntel("");
        setOperationalIntel("");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [basePath, ownerId, ownerKey]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [ownerKey]: ownerId,
          regionalIntel,
          operationalIntel,
        }),
      });
      if (!res.ok) throw new Error("Failed to save intel.");
      setMessage("Intel saved.");
    } catch {
      setMessage("Failed to save intel.");
    } finally {
      setSaving(false);
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
        {loading ? (
          <div className="text-xs text-zinc-500 font-mono uppercase tracking-[0.18em]">
            Loading intel...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500">
                Regional Intel
              </Label>
              <Textarea
                value={regionalIntel}
                onChange={(e) => setRegionalIntel(e.target.value)}
                className="min-h-[96px]"
                placeholder="Regional terrain, civil posture, climate, and movement corridors..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500">
                Operational Intel
              </Label>
              <Textarea
                value={operationalIntel}
                onChange={(e) => setOperationalIntel(e.target.value)}
                className="min-h-[120px]"
                placeholder="Threat disposition, force estimate, key objectives, and tactical constraints..."
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-[0.14em]">
            {message ?? "Ready"}
          </p>
          <Button
            type="button"
            size="sm"
            className="bg-accent hover:bg-accent-darker text-black"
            onClick={save}
            disabled={saving || loading}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Intel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

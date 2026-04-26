"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { primaryBtn, secondaryBtn } from "./action-buttons";

type RepositoryItem = {
  id: string;
  [key: string]: unknown;
};

export function RepositoryPicker({
  title,
  fetchUrl,
  attachUrl,
  missionId,
  backHref,
  renderItem,
  alreadyAttachedIds,
}: {
  title: string;
  fetchUrl: string;
  attachUrl: (id: string) => string;
  missionId: string;
  backHref: string;
  renderItem: (item: RepositoryItem) => ReactNode;
  alreadyAttachedIds: Set<string>;
}) {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(fetchUrl);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [fetchUrl]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const attachSelected = async () => {
    setSubmitting(true);
    try {
      for (const id of selected) {
        await fetch(attachUrl(id), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ missionId }),
        });
      }
      setSelected(new Set());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800/70 rounded-xl bg-white dark:bg-zinc-900/50">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/70">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700 dark:text-zinc-300">
            {title}
          </CardTitle>
          <Button asChild variant="outline" className={secondaryBtn}>
            <Link href={backHref}>Back</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {loading ? (
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.16em]">
            Loading repository...
          </p>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/40">
            No repository items available.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const id = String(item.id);
              const attached = alreadyAttachedIds.has(id);
              return (
                <label
                  key={id}
                  className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    disabled={attached}
                    checked={selected.has(id)}
                    onChange={() => toggle(id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    {renderItem(item)}
                    {attached && (
                      <p className="text-[10px] mt-1 uppercase tracking-wider text-zinc-500">
                        Already attached
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            className={primaryBtn}
            disabled={submitting || selected.size === 0}
            onClick={() => void attachSelected()}
          >
            Attach Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

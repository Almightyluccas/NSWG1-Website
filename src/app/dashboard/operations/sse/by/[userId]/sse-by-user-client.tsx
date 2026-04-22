"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MockSseItem } from "@/types/sse";

export function SseByUserClient({ userId }: { userId: string }) {
  const [items, setItems] = useState<MockSseItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sse?uploadedBy=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const uploaderName = items[0]?.uploader_name || userId;
  const filtered = useMemo(
    () =>
      items
        .filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [items, search],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <Link
            href="/dashboard/operations/sse"
            className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-accent uppercase tracking-widest mb-2"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back to SSE Library
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
            Uploads by {uploaderName}
          </h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">
            {items.length} total frame(s)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search uploaded frames..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500 font-mono uppercase tracking-widest">Loading uploads...</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center border border-dashed rounded-lg text-xs text-zinc-500 uppercase tracking-widest">
          No uploads found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3 space-y-3">
              <div className="aspect-[16/10] rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name || "SSE frame"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">No image</div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.name || "Unnamed frame"}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                <Link href={`/dashboard/operations/sse/${item.id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase tracking-widest">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


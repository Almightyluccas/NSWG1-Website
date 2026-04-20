"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { type DirectiveItem } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function DirectivesWidget() {
  const [directives, setDirectives] = useState<DirectiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDirectives() {
      try {
        const res = await fetch("/api/dashboard/directives");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDirectives(data);
        } else {
          setDirectives([]);
        }
      } catch (error) {
        console.error("Failed to fetch directives:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDirectives();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {directives.map((directive) => {
        const isDone = directive.status === "done";
        return (
          <div
            key={directive.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 border rounded-lg gap-2 shadow-inner ${
              isDone
                ? "bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-zinc-800/30 opacity-70"
                : "bg-zinc-50 dark:bg-black/30 hover:bg-zinc-100 dark:hover:bg-black/50 transition-colors border-zinc-200 dark:border-zinc-800/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  isDone
                    ? "bg-zinc-300 dark:bg-zinc-700"
                    : "bg-accent shadow-[0_0_8px_rgba(var(--accent-color),0.8)] animate-pulse"
                }`}
              />
              <span
                className={`text-xs ${
                  isDone ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {directive.label}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] font-mono w-fit px-1.5 py-0 rounded-md ${
                isDone
                  ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-500/80"
                  : "border-zinc-300 dark:border-zinc-600/50 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {isDone ? "DONE" : "PENDING"}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

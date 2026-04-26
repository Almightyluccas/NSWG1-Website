"use client";

import { useEffect, useState } from "react";
import { type AlertItem } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

export function AlertCenterWidget() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const alertKey = (a: AlertItem) => `${a.source ?? "system"}:${a.id}`;

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/dashboard/alerts");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  async function dismissPerscom(alert: AlertItem) {
    const res = await fetch("/api/dashboard/perscom-notifications/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alert.id }),
    });
    if (res.ok) {
      setAlerts((prev) => prev.filter((x) => alertKey(x) !== alertKey(alert)));
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center py-4">
        No alerts
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isPriority = alert.type === "priority";
        return (
          <div
            key={alertKey(alert)}
            className={`${
              isPriority
                ? "bg-red-50 dark:bg-red-500/5 border-l-2 border-red-500/60 group hover:bg-red-100 dark:hover:bg-red-500/10"
                : "bg-zinc-50 dark:bg-zinc-900/40 border-l-2 border-accent/60 group hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
            } p-2.5 rounded-r-lg relative overflow-hidden transition-colors shadow-inner pr-8`}
          >
            {isPriority && (
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-bl-[100%] pointer-events-none" />
            )}
            {alert.source === "perscom" && alert.dismissible !== false && (
              <button
                type="button"
                onClick={() => void dismissPerscom(alert)}
                className="absolute top-1.5 right-1.5 p-1 rounded text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <p
              className={`text-[9px] font-mono ${
                isPriority
                  ? "text-red-500 dark:text-red-400/90"
                  : "text-accent/70"
              } mb-1 tracking-wider flex items-center gap-2 flex-wrap`}
            >
              <span>{alert.label}</span>
              {alert.source === "perscom" && (
                <span className="text-[8px] text-violet-400 font-black">
                  PERSCOM
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              {alert.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}

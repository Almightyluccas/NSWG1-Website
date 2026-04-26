"use client";

import { useState, useEffect, useCallback } from "react";
import { type AlertItem } from "@/types/dashboard";
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  Search,
  Filter,
  BellRing,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AlertsClient() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/alerts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlerts(data);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  const alertKey = (a: AlertItem) => `${a.source ?? "system"}:${a.id}`;

  const dismissPerscom = async (alert: AlertItem) => {
    const res = await fetch("/api/dashboard/perscom-notifications/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alert.id }),
    });
    if (res.ok) {
      setAlerts((prev) => prev.filter((x) => alertKey(x) !== alertKey(alert)));
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesBucket = true;
    if (filterType === "PERSCOM") {
      matchesBucket = alert.source === "perscom";
    } else if (filterType === "SYSTEM") {
      matchesBucket = alert.source !== "perscom";
    } else if (filterType !== "ALL") {
      matchesBucket = alert.type === filterType;
    }

    return matchesSearch && matchesBucket;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 text-xs font-mono uppercase tracking-widest h-9 rounded-lg"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[140px]"
              >
                <option value="ALL">ALL PRIORITIES</option>
                <option value="priority">PRIORITY (RED)</option>
                <option value="warning">WARNING (AMBER)</option>
                <option value="info">INFO (BLUE)</option>
                <option value="PERSCOM">PERSCOM ONLY</option>
                <option value="SYSTEM">SYSTEM ONLY</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Feed */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 p-3 bg-white dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <BellRing className="h-3 w-3 text-accent" />
            Active Alerts Log
          </span>
          <span className="text-[9px] font-mono text-zinc-500">
            {filteredAlerts.length} ENTRIES
          </span>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/40">
          {isLoading ? (
            <div className="p-8 text-center text-[10px] font-mono text-accent uppercase tracking-widest animate-pulse">
              [ ESTABLISHING SECURE HANDSHAKE... ]
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              [ NO ALERTS ON FILE ]
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alertKey(alert)}
                className="relative flex flex-col md:flex-row md:items-center gap-3 p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-colors group"
              >
                {/* Left classification strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                    alert.type === "priority"
                      ? "bg-red-500"
                      : alert.type === "warning"
                        ? "bg-amber-500"
                        : "bg-accent"
                  }`}
                />

                <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
                  <div className="shrink-0 mt-0.5">
                    {alert.type === "priority" ? (
                      <ShieldAlert className="h-4 w-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    ) : alert.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    ) : (
                      <Info className="h-4 w-4 text-accent drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h4
                        className={`text-[13px] font-black tracking-widest uppercase ${
                          alert.type === "priority"
                            ? "text-red-400"
                            : alert.type === "warning"
                              ? "text-amber-400"
                              : "text-accent"
                        }`}
                      >
                        {alert.label}
                      </h4>
                      {alert.source === "perscom" && (
                        <Badge
                          variant="outline"
                          className="text-[8px] font-black px-1.5 py-0 border-violet-500/40 text-violet-400"
                        >
                          PERSCOM
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black px-1.5 py-0 leading-tight uppercase tracking-widest ${
                          alert.type === "priority"
                            ? "border-red-500/30 text-red-500"
                            : alert.type === "warning"
                              ? "border-amber-500/30 text-amber-500"
                              : "border-accent/30 text-accent"
                        }`}
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                        ID: {alert.id}
                      </span>
                      {alert.event && (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          {alert.event}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {alert.source === "perscom" && alert.dismissible !== false && (
                  <button
                    type="button"
                    onClick={() => void dismissPerscom(alert)}
                    className="shrink-0 p-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Dismiss for me"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

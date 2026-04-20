"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Bell, AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { MobileSidebarTrigger } from "@/components/dashboard/sidebar";
import { type AlertItem } from "@/types/dashboard";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/alerts": "Alert Center",
  "/dashboard/operations": "Operations Center",
  "/dashboard/operations/sse": "SSE Repository",
  "/dashboard/operations/sse/upload": "Upload SSE Record",
  "/dashboard/operations/management": "Op Management",
  "/dashboard/operations/management/campaigns/new": "New Campaign",
  "/dashboard/operations/management/training/new": "New Training",
  "/dashboard/calendar": "Calendar",
  "/dashboard/perscom/roster": "Roster",
  "/dashboard/perscom/awards": "Awards",
  "/dashboard/perscom/ranks": "Ranks",
  "/dashboard/perscom/qualifications": "Qualifications",
  "/dashboard/forms": "Forms",
  "/dashboard/forms/my-submissions": "My Submissions",
  "/dashboard/documents": "Documents",
  "/dashboard/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  const sorted = Object.keys(routeTitles).sort((a, b) => b.length - a.length);
  for (const path of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return routeTitles[path];
    }
  }
  return "Dashboard";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [clearedKeys, setClearedKeys] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);

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
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    }
    fetchAlerts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title = getPageTitle(pathname);
  const alertKey = (a: AlertItem) => `${a.source ?? "system"}:${a.id}`;
  const visibleAlerts = alerts.filter((a) => !clearedKeys.has(alertKey(a)));

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-50">
      <div className="flex items-center gap-3">
        <MobileSidebarTrigger />
        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse hidden sm:block" />
        <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className={`relative p-2 rounded-lg transition-colors group outline-none ${
              isAlertsOpen
                ? "bg-zinc-100 dark:bg-zinc-800/80 text-accent"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-accent"
            }`}
            title="Alert Center"
          >
            <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
            {visibleAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="border-b border-zinc-100 dark:border-zinc-800/80 p-3 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-zinc-700 dark:text-zinc-300">Active Alerts</span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">{visibleAlerts.length} ALERTS</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {visibleAlerts.length === 0 ? (
                  <div className="p-4 text-center text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    No active alerts
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {visibleAlerts.map((alert) => (
                      <div
                        key={alertKey(alert)}
                        className="p-3 border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 relative group transition-colors text-left flex justify-between items-start gap-2"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                          alert.type === "priority" ? "bg-red-500" :
                          alert.type === "warning" ? "bg-amber-500" : "bg-accent"
                        }`} />
                        <div className="pl-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {alert.type === "priority" ? (
                              <ShieldAlert className="h-3 w-3 text-red-500" />
                            ) : alert.type === "warning" ? (
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            ) : (
                              <Info className="h-3 w-3 text-accent" />
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                              alert.type === "priority" ? "text-red-400" :
                              alert.type === "warning" ? "text-amber-400" : "text-accent"
                            }`}>
                              {alert.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                            {alert.message}
                          </p>
                        </div>
                        {(alert.source !== "perscom" ||
                          alert.dismissible !== false) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (alert.source === "perscom") {
                                void fetch(
                                  "/api/dashboard/perscom-notifications/dismiss",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: alert.id }),
                                  }
                                ).then((res) => {
                                  if (res.ok) {
                                    setAlerts((prev) =>
                                      prev.filter(
                                        (x) => alertKey(x) !== alertKey(alert)
                                      )
                                    );
                                  }
                                });
                              } else {
                                setClearedKeys((prev) =>
                                  new Set(prev).add(alertKey(alert))
                                );
                              }
                            }}
                            className="p-1 rounded-md text-zinc-400 dark:text-zinc-500 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                            title="Dismiss Alert"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/30">
                <Link
                  href="/dashboard/alerts"
                  onClick={() => setIsAlertsOpen(false)}
                  className="block w-full text-center py-2 rounded-md text-[10px] font-black text-zinc-400 dark:text-zinc-500 hover:text-accent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 uppercase tracking-widest transition-colors"
                >
                  VIEW ALL ALERTS
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800/80 hidden sm:block" />

        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            {session?.user?.name || "OPERATOR"}
          </p>
        </div>
        <div className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              OP
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

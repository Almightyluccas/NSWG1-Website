"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AttendanceRecord {
  date: string;
  status: string;
  event_name: string;
  event_type: string;
}

interface AttendanceWidgetProps {
  records: AttendanceRecord[];
}

export function AttendanceWidget({ records }: AttendanceWidgetProps) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const recentRecords = records.slice(0, 5);

  const statusColor: Record<string, string> = {
    present:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    absent: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    late: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    excused:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox
          label="PRESENT"
          value={present}
          accent="text-green-600 dark:text-green-400"
        />
        <StatBox
          label="ABSENT"
          value={absent}
          accent="text-red-600 dark:text-red-400"
        />
        <StatBox
          label="LATE"
          value={late}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatBox
          label="EXCUSED"
          value={excused}
          accent="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-2.5 shadow-inner">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider">
            ATTENDANCE RATE
          </span>
          <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200 font-bold">
            {rate}%
          </span>
        </div>
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full transition-all duration-500"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {recentRecords.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 tracking-widest mb-2">
            RECENT EVENTS
          </p>
          {recentRecords.map((record, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    record.status === "present"
                      ? "bg-green-500"
                      : record.status === "absent"
                        ? "bg-red-500"
                        : record.status === "late"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                  }`}
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                  {record.event_name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {record.date}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[8px] font-mono px-1 py-0 rounded-md ${
                    statusColor[record.status] ||
                    "text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {record.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border border-zinc-200 dark:border-zinc-700/50 border-dashed rounded-lg bg-zinc-50 dark:bg-black/20">
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            No attendance records
          </p>
        </div>
      )}

      <Link href="/dashboard/calendar" className="block">
        <Button
          size="sm"
          variant="ghost"
          className="w-full h-7 text-[10px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all rounded-lg border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700/50"
        >
          <ExternalLink className="h-3 w-3 mr-1.5 opacity-70" />
          VIEW FULL CALENDAR
        </Button>
      </Link>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-2.5 text-center shadow-inner">
      <div className={`text-lg font-bold font-mono ${accent}`}>{value}</div>
      <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 tracking-widest">
        {label}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HelpCircle, XCircle, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrUpdateMissionRSVP, createOrUpdateTrainingRSVP } from "@/app/dashboard/calendar/action";

type RsvpStatus = "attending" | "not-attending" | "maybe" | null;

interface UpcomingOpsWidgetProps {
  upcomingOps?: any[];
  currentUserId?: string;
}

export function UpcomingOpsWidget({ upcomingOps = [], currentUserId }: UpcomingOpsWidgetProps) {
  const router = useRouter();
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, RsvpStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUserId || !upcomingOps.length) return;

    const initialStatuses: Record<string, RsvpStatus> = {};
    upcomingOps.forEach((op) => {
      const myRsvp = op.rsvps?.find((r: any) => r.userId === currentUserId);
      if (myRsvp) {
        initialStatuses[op.id] = myRsvp.status;
      }
    });
    setRsvpStatuses(initialStatuses);
  }, [upcomingOps, currentUserId]);

  const handleRsvp = async (op: any, status: RsvpStatus) => {
    if (!currentUserId || isSubmitting[op.id]) return;

    const prevStatus = rsvpStatuses[op.id];
    setRsvpStatuses((prev) => ({ ...prev, [op.id]: status }));
    setIsSubmitting((prev) => ({ ...prev, [op.id]: true }));

    try {
      if (op.type === "mission") {
        await createOrUpdateMissionRSVP({
          missionId: op.id,
          status: status as "attending" | "not-attending" | "maybe",
        });
      } else {
        await createOrUpdateTrainingRSVP({
          trainingId: op.id,
          status: status as "attending" | "not-attending" | "maybe",
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to RSVP:", error);
      setRsvpStatuses((prev) => ({ ...prev, [op.id]: prevStatus || null }));
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [op.id]: false }));
    }
  };

  return (
    <div className="space-y-3">
      {upcomingOps.length === 0 ? (
        <div className="text-center p-6 border border-zinc-200 dark:border-zinc-700/50 border-dashed rounded-lg bg-zinc-50 dark:bg-black/20">
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            No upcoming ops
          </p>
        </div>
      ) : (
        upcomingOps.map((op) => {
          const currentRsvp = rsvpStatuses[op.id] || null;
          const loading = isSubmitting[op.id];
          const isMandatory = true;

          return (
            <div
              key={op.id}
              className="border border-zinc-200 dark:border-zinc-700/40 rounded-lg bg-zinc-50 dark:bg-black/30 overflow-hidden shadow-inner relative"
            >
              <div
                className={`absolute top-0 bottom-0 left-0 w-[2px] ${
                  isMandatory ? "bg-accent/80" : "bg-zinc-400 dark:bg-zinc-600/50"
                }`}
              />

              <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-100 dark:bg-black/40 pl-3">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs tracking-wide">
                    {op.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className={
                      isMandatory
                        ? "bg-accent/10 text-accent border-accent/30 text-[9px] px-1.5 py-0 rounded-md font-mono tracking-wider"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/60 text-[9px] px-1.5 py-0 rounded-md font-mono tracking-wider"
                    }
                  >
                    {isMandatory ? "REQ" : "OPT"}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">
                  {op.date} @ {op.time}
                </p>
              </div>

              <div className="p-2 space-y-2 pl-3">
                <div className="grid grid-cols-3 gap-1.5 relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleRsvp(op, "attending")}
                    className={`h-7 px-0 text-[10px] font-mono transition-all rounded-lg ${
                      currentRsvp === "attending"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/40 hover:bg-green-500/20"
                        : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/80 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500/30"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">IN</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleRsvp(op, "maybe")}
                    className={`h-7 px-0 text-[10px] font-mono transition-all rounded-lg ${
                      currentRsvp === "maybe"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
                        : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/80 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30"
                    }`}
                  >
                    <HelpCircle className="h-3 w-3 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">TBD</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleRsvp(op, "not-attending")}
                    className={`h-7 px-0 text-[10px] font-mono transition-all rounded-lg ${
                      currentRsvp === "not-attending"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40 hover:bg-red-500/20"
                        : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/80 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30"
                    }`}
                  >
                    <XCircle className="h-3 w-3 sm:mr-1 shrink-0" />
                    <span className="hidden sm:inline">OUT</span>
                  </Button>
                </div>

                <Link href="/dashboard/calendar" className="block">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-6 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50"
                  >
                    <ExternalLink className="h-3 w-3 mr-1.5 opacity-70" />
                    DETAILS
                  </Button>
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

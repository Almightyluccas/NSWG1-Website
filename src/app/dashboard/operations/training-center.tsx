"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  MapPin,
  Clock,
  ShieldAlert,
  Users,
  MessageSquare,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface TrainingRecord {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  max_personnel?: number;
  status: string;
  created_by: string;
  created_at: string;
}

const TRAINING_STATUSES = [
  { key: "scheduled", tabLabel: "UPCOMING" },
  { key: "in-progress", tabLabel: "ACTIVE" },
  { key: "completed", tabLabel: "COMPLETED" },
] as const;

export function TrainingCenter() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(TRAINING_STATUSES[0].key);

  useEffect(() => {
    async function fetchTrainings() {
      try {
        const res = await fetch("/api/training");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrainings(data);
        } else {
          setTrainings([]);
        }
      } catch (error) {
        console.error("Failed to fetch trainings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainings();
  }, []);

  const filteredTrainings = useMemo(
    () => trainings.filter((t) => t.status === activeTab),
    [trainings, activeTab],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-panel scan-lines accent-border-top p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-900/60" />
          <Skeleton className="h-6 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-900/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-[160px] rounded-lg bg-zinc-200 dark:bg-zinc-900/60" />
          <Skeleton className="h-[160px] rounded-lg bg-zinc-200 dark:bg-zinc-900/60" />
          <Skeleton className="h-[160px] rounded-lg bg-zinc-200 dark:bg-zinc-900/60 hidden lg:block" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-panel scan-lines accent-border-top">
        <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-[0.2em]">
              Training Command
            </CardTitle>
            <p className="mt-1 text-[11px] text-zinc-400">
              Upcoming ranges, sims, and mandatory evolutions for the task force.
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList className="bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800/80 h-auto rounded-lg">
              {TRAINING_STATUSES.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-accent data-[state=active]:shadow-sm"
                >
                  {tab.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTrainings.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel scan-lines border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
            <ShieldAlert className="h-8 w-8 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-700 dark:text-zinc-300 font-semibold text-xs uppercase tracking-[0.2em]">
              No training records on file for this status
            </p>
          </div>
        ) : (
          filteredTrainings.map((t) => <TrainingCard key={t.id} training={t} />)
        )}
      </div>
    </div>
  );
}

function TrainingCard({ training }: { training: TrainingRecord }) {
  const isCompleted = training.status === "completed";

  return (
    <Card className="glass-panel scan-lines border-zinc-200 dark:border-zinc-800/80 rounded-lg hover:border-accent/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all cursor-pointer relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/60" />

      <CardContent className="p-3.5 pl-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {training.status === "in-progress" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
              )}
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.18em] truncate">
                {training.name}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 font-medium">
              <MapPin className="h-3 w-3 text-zinc-500" />
              {training.location}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 ${
              isCompleted
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
                : "bg-accent/10 text-accent border-accent/30"
            }`}
          >
            {training.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 line-clamp-2 min-h-[32px]">
            {training.description}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/70 flex items-center justify-between mt-auto text-[11px] text-zinc-700 dark:text-zinc-300">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3 text-zinc-500" />
              {training.date}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-zinc-500" />
              {training.time}
            </div>
            {training.max_personnel && (
              <div className="hidden lg:flex items-center gap-1.5">
                <Users className="h-3 w-3 text-zinc-500" />
                {training.max_personnel} slots
              </div>
            )}
          </div>
          {isCompleted && (
            <Link
              href="#"
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-accent transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Debrief
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

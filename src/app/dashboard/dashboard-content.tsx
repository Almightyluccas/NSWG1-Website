// removed use client to make this a Server Component

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PersonnelFileServerWidget from "@/components/dashboard/widgets/personnel-file-server-widget";
import UpcomingOpsServerWidget from "@/components/dashboard/widgets/upcoming-ops-server-widget";
import AttendanceServerWidget from "@/components/dashboard/widgets/attendance-server-widget";
import {
  Bell,
  Target,
  CalendarDays,
  FolderOpen,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PerscomUserResponse } from "@/types/api/perscomApi";
import Image from "next/image";
import { differenceInMonths, differenceInYears } from "date-fns";

import { type WidgetConfig } from "@/components/dashboard/widgets/widget-types";
import { WidgetWrapper } from "@/components/dashboard/widgets/widget-wrapper";
import { AlertCenterWidget } from "@/components/dashboard/widgets/alert-center-widget";
import { DirectivesWidget } from "@/components/dashboard/widgets/directives-widget";
import { UpcomingOpsWidget } from "@/components/dashboard/widgets/upcoming-ops-widget";
import { AttendanceWidget } from "@/components/dashboard/widgets/attendance-widget";
import { PersonnelFileWidget } from "@/components/dashboard/widgets/personnel-file-widget";

interface DashboardContentProps {
  user: PerscomUserResponse;
  rankImage: { id: number; imageUrl: string | null; name: string } | null;
  currentUserId: string;
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3 p-3 pt-1">
      <Skeleton className="h-10 w-full bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
      <Skeleton className="h-16 w-full bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
      <Skeleton className="h-16 w-full bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
    </div>
  );
}

// ── Widget Layout Configuration ──
// This array controls the order, visibility, and sizing of all dashboard widgets.
// Future: users will override this with a saved layout from the database.
const WIDGET_LAYOUT: WidgetConfig[] = [
  { id: "alerts", title: "Alert Center", icon: Bell, size: "sm" },
  { id: "directives", title: "Active Directives", icon: Target, size: "sm" },
  { id: "upcoming-ops", title: "Upcoming Ops", icon: CalendarDays, size: "sm" },
  { id: "attendance", title: "Attendance Summary", icon: BarChart3, size: "md" },
  { id: "personnel-file", title: "Awards Rack", icon: FolderOpen, size: "sm" },
];

export function DashboardContent({
  user,
  rankImage,
  currentUserId,
}: DashboardContentProps) {
  // Map widget IDs to their rendered content
  const widgetContent: Record<string, React.ReactNode> = {
    alerts: <AlertCenterWidget />,
    directives: <DirectivesWidget />,
    "upcoming-ops": (
      <Suspense fallback={<WidgetSkeleton />}>
        <UpcomingOpsServerWidget currentUserId={currentUserId} />
      </Suspense>
    ),
    attendance: (
      <Suspense fallback={<WidgetSkeleton />}>
        <AttendanceServerWidget userId={currentUserId} />
      </Suspense>
    ),
    "personnel-file": (
      <Suspense fallback={<WidgetSkeleton />}>
        <PersonnelFileServerWidget user={user} />
      </Suspense>
    ),
  };

  const createdDate = new Date(user.created_at);
  const now = new Date();
  
  // Time in Service (TIS)
  const tisMonthsTotal = differenceInMonths(now, createdDate);
  const tisYears = Math.floor(tisMonthsTotal / 12);
  const tisMonths = tisMonthsTotal % 12;
  const tisString = `${tisYears}Y ${tisMonths}M`;

  // Time in Position (TIP)
  const assignmentDate = user.last_assignment_change_date 
    ? new Date(user.last_assignment_change_date) 
    : createdDate;
  const tipMonthsTotal = differenceInMonths(now, assignmentDate);
  const tipYears = Math.floor(tipMonthsTotal / 12);
  const tipMonths = tipMonthsTotal % 12;
  const tipString = `${tipYears}Y ${tipMonths}M`;

  // Time in Grade (TIG)
  const rankDate = user.last_rank_change_date
    ? new Date(user.last_rank_change_date)
    : createdDate;
  const tigMonthsTotal = differenceInMonths(now, rankDate);
  const tigYears = Math.floor(tigMonthsTotal / 12);
  const tigMonths = tigMonthsTotal % 12;
  const tigString = `${tigYears}Y ${tigMonths}M`;

  const paygrade = user.rank?.paygrade || "N/A";

  return (
    <>
      {/* Background Animated Grid Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.02]">
        <div
          className="absolute inset-0 animate-grid-scroll"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            height: "200%",
            top: "-100%",
          }}
        />
      </div>

      <div className="space-y-5 w-full">
        {/* Header Card — Military ID Style */}
        <div className="relative overflow-hidden rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/60 backdrop-blur-md">
          <div className="dashboard-id-card-diagonal-stripes" aria-hidden />

          <div className="p-5 md:p-6 flex flex-col md:flex-row items-center md:items-stretch gap-6 relative z-10 w-full">
            <div className="flex items-center gap-6 shrink-0 z-20">
              <div className="relative w-32 h-40 border-2 border-zinc-300 dark:border-zinc-500 shadow-xl bg-zinc-100 dark:bg-zinc-950 shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={"https://cdn.discordapp.com/attachments/985651457040732341/1490535861144780982/image.png?ex=69d46932&is=69d317b2&hm=17ce629c79399202f0f2b8dd1840292eff29b3cee11ce32396e39716707043bb&"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay pointer-events-none"></div>
              </div>

              <div className="hidden lg:flex flex-col items-center justify-center bg-zinc-100/80 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/80 p-2 rounded-lg shadow-inner h-full w-24">
                <div className="h-16 w-16 relative flex items-center justify-center mb-1">
                  <Image
                    src={rankImage?.imageUrl || "/placeholder.svg"}
                    alt={rankImage?.name || "Rank"}
                    fill
                    className="object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                  />
                </div>
                <div className="mt-2 text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 text-center uppercase border-t border-zinc-200 dark:border-zinc-800/80 pt-1 w-full relative">
                  <span className="bg-zinc-100 dark:bg-zinc-950 px-1 relative -top-[10px]">GRADE</span>
                  <br />
                  <span className="text-zinc-800 dark:text-zinc-200 font-bold relative -top-1">{paygrade}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between w-full z-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[9px] font-mono tracking-widest uppercase mb-1 flex items-center gap-2">
                    <span className="text-accent">IDENTIFICATION CARD</span>
                    <span className="hidden sm:inline">{"// ARMED FORCES OF THE UNITED STATES"}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </h1>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-zinc-400 dark:text-zinc-500 text-[9px] font-mono tracking-widest uppercase mb-1">
                    OPERATOR ID
                  </div>
                  <div className="font-mono text-sm tracking-widest text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-black/60 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/60 inline-block shadow-inner">
                    {(currentUserId || user.id.toString()).slice(0, 10).padStart(10, "0")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5 bg-zinc-50 dark:bg-black/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 shadow-inner w-full flex-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-0.5">Status</span>
                  <Badge variant="outline" className="w-fit bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 px-2 py-0.5 font-mono uppercase tracking-widest text-[10px] rounded-md">
                    {user.status?.name || "ACTIVE"}
                  </Badge>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Rank</span>
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 uppercase tracking-widest truncate">
                    {user.rank?.name || "UNASSIGNED"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Unit</span>
                  <span className="text-xs font-mono text-accent italic tracking-widest uppercase truncate break-words">
                    {user.unit?.name || "UNASSIGNED"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Position</span>
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300 tracking-widest uppercase truncate">
                    {user.position?.name || "UNASSIGNED"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Time in Service</span>
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 tracking-widest uppercase">
                    {tisString}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Time in Position</span>
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 tracking-widest uppercase">
                    {tipString}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase mb-1">Time in Grade</span>
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 tracking-widest uppercase">
                    {tigString}
                  </span>
                </div>

                <div className="flex flex-col col-span-1 items-end justify-center opacity-70 mt-1">
                  <div className="dashboard-id-barcode-line" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget Grid — full width, 3 cols on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WIDGET_LAYOUT.map((widget) => (
            <WidgetWrapper key={widget.id} config={widget}>
              {widgetContent[widget.id]}
            </WidgetWrapper>
          ))}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AttendanceCalendar } from "@/components/calendar/calendar";
import { AttendanceStats } from "@/components/calendar/stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { getAttendanceRecords } from "./action";
import { UserRole } from "@/types/database";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late" | "excused";
  event: string;
}

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("calendar");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.roles?.includes(UserRole.admin) ?? false;

  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!session?.user) return;
      try {
        setLoading(true);
        const data = await getAttendanceRecords();
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadAttendanceData();
    }
  }, [session]);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <FadeIn>
      <div>
        <div className="mb-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
            Calendar
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs font-mono tracking-wider uppercase">
            {isAdmin
              ? "Monitor and manage calendar records"
              : "View your calendar records"}
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700/40 mb-4">
          <div className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/60 p-1 h-auto rounded-lg shadow-inner">
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2 text-xs font-mono tracking-widest rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:border-b-2 data-[state=active]:border-b-accent/80 border-b-2 border-b-transparent transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger
                  value="statistics"
                  className="flex items-center gap-2 text-xs font-mono tracking-widest rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800/80 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:border-b-2 data-[state=active]:border-b-accent/80 border-b-2 border-b-transparent transition-all"
                >
                  <BarChart className="h-4 w-4" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-4">
                <AttendanceCalendar
                  attendanceData={attendanceData}
                  isAdmin={isAdmin}
                  userId={session?.user?.id}
                />
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4">
                <AttendanceStats isAdmin={isAdmin} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

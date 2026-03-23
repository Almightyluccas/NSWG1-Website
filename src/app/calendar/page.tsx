"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AttendanceCalendar } from "@/components/calendar/calendar";
import { AttendanceStats } from "@/components/calendar/stats";
import { CampaignsTab } from "@/components/calendar/campaignsTab";
import { TrainingTab } from "@/components/calendar/trainingTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart, Target, GraduationCap } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { getAttendanceRecords } from "./action";

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

  const isAdmin = session?.user?.roles.includes("admin");
  const isMember = session?.user?.roles?.includes("member");

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

  const pageContent = (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Calendar</h1>
        <p className="text-zinc-400 mt-1">
          {isAdmin
            ? "Monitor and manage calendar records"
            : "View your calendar records"}
        </p>
      </div>

      <div className="bg-zinc-800 rounded-lg shadow-md border border-zinc-700 mb-8">
        <div className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger
                value="campaigns"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Training
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

            <TabsContent value="campaigns" className="space-y-4">
              <CampaignsTab />
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <TrainingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  if (isMember) {
    return (
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">{pageContent}</main>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <FadeIn>{pageContent}</FadeIn>
        </div>
      </section>
      <Footer />
    </main>
  );
}


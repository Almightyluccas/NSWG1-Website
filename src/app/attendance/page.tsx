"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AttendanceCalendar } from "@/components/attendance/calendar"
import { AttendanceStats } from "@/components/attendance/stats"
import { UserSelector } from "@/components/attendance/user-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { FadeIn } from "@/components/fade-in"
import { useSession } from "next-auth/react"

// Mock attendance data
const mockAttendanceData = {
  // User ID -> attendance records
  "123456789": [
    { date: "2025-04-01", status: "present", event: "Weekly Training" },
    { date: "2025-04-08", status: "present", event: "Weekly Training" },
    { date: "2025-04-15", status: "absent", event: "Weekly Training" },
    { date: "2025-04-22", status: "present", event: "Weekly Training" },
    { date: "2025-04-29", status: "late", event: "Weekly Training" },
    { date: "2025-05-06", status: "present", event: "Weekly Training" },
    { date: "2025-05-13", status: "LOA", event: "Weekly Training" },
    { date: "2025-04-04", status: "present", event: "Operation" },
    { date: "2025-04-18", status: "present", event: "Operation" },
    { date: "2025-05-02", status: "absent", event: "Operation" },
  ],
  "987654321": [
    { date: "2025-04-01", status: "present", event: "Weekly Training" },
    { date: "2025-04-08", status: "absent", event: "Weekly Training" },
    { date: "2025-04-15", status: "absent", event: "Weekly Training" },
    { date: "2025-04-22", status: "present", event: "Weekly Training" },
    { date: "2025-04-29", status: "present", event: "Weekly Training" },
    { date: "2025-05-06", status: "late", event: "Weekly Training" },
    { date: "2025-05-13", status: "present", event: "Weekly Training" },
    { date: "2025-04-04", status: "absent", event: "Operation" },
    { date: "2025-04-18", status: "present", event: "Operation" },
    { date: "2025-05-02", status: "present", event: "Operation" },
  ],
  "L. Graterol": [
    { date: "2025-04-01", status: "absent", event: "Weekly Training" },
    { date: "2025-04-08", status: "present", event: "Weekly Training" },
    { date: "2025-04-15", status: "present", event: "Weekly Training" },
    { date: "2025-04-22", status: "present", event: "Weekly Training" },
    { date: "2025-04-29", status: "absent", event: "Weekly Training" },
    { date: "2025-05-06", status: "present", event: "Weekly Training" },
    { date: "2025-05-13", status: "LOA", event: "Weekly Training" },
    { date: "2025-04-04", status: "present", event: "Operation" },
    { date: "2025-04-18", status: "absent", event: "Operation" },
    { date: "2025-05-02", status: "present", event: "Operation" },
  ],
}

// Mock user data
const mockUsers = [
  {
    id: "123456789",
    username: "CommanderAlpha",
    discriminator: "1234",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    name: "J. Smith",
    unit: "Task Force 160th",
    position: "Commander",
  },
  {
    id: "987654321",
    username: "OperatorBravo",
    discriminator: "5678",
    avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
    name: "R. Johnson",
    unit: "TACDEVRON2",
    position: "Operator",
  },
  {
    id: "L. Graterol",
    username: "RecruitCharlie",
    discriminator: "9012",
    avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    name: "M. Williams",
    unit: "Pending Assignment",
    position: "Recruit",
  },
]

export default function AttendancePage() {
  const { data: session } = useSession();
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("calendar")

  // Set the selected user to the current user on initial load
  useEffect(() => {
    if (session) {
      setSelectedUserId(session?.user?.name || null)
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
  }, [session, router])

  if (!session) {
    return null // Don't render anything while redirecting
  }

  // Get attendance data for the selected user
  const attendanceData = selectedUserId ? mockAttendanceData[selectedUserId] || [] : []

  // Find user details
  const selectedUser = mockUsers.find((u) => u.id === selectedUserId)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Attendance Tracker</h1>
                <p className="text-gray-500 dark:text-zinc-400 mt-1">
                  {["admin", "superAdmin"].some(role => session.user.roles.includes(role)) ?
                    "Monitor and manage attendance records" :
                    "View your attendance records"
                  }
                </p>
              </div>

              {["admin", "superAdmin"].some(role => session.user.roles.includes(role)) && (
                <UserSelector users={mockUsers} selectedUserId={selectedUserId} onSelectUser={setSelectedUserId} />
              )}
            </div>

            {selectedUser && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-full">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectedUser.name} ({selectedUser.username}#{selectedUser.discriminator})
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-400">
                          {selectedUser.unit} • {selectedUser.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                      {["admin", "superAdmin"].some(role => session.user.roles.includes(role)) && (
                        <Button className="bg-accent hover:bg-accent-darker text-black" size="sm">
                          Edit Records
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendar View
                      </TabsTrigger>
                      <TabsTrigger value="statistics" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Statistics
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar" className="space-y-4">
                      <AttendanceCalendar attendanceData={attendanceData} />
                    </TabsContent>

                    <TabsContent value="statistics" className="space-y-4">
                      <AttendanceStats attendanceData={attendanceData} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}

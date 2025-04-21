"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, CalendarIcon } from "lucide-react"

interface AttendanceRecord {
  date: string
  status: "present" | "absent" | "late" | "LOA"
  event: string
}

interface AttendanceStatsProps {
  attendanceData: AttendanceRecord[]
}

export function AttendanceStats({ attendanceData }: AttendanceStatsProps) {
  // Calculate attendance statistics
  const stats = useMemo(() => {
    const total = attendanceData.length
    const present = attendanceData.filter((record) => record.status === "present").length
    const absent = attendanceData.filter((record) => record.status === "absent").length
    const late = attendanceData.filter((record) => record.status === "late").length
    const LOA = attendanceData.filter((record) => record.status === "LOA").length

    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0
    const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0
    const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0
    const LOAPercentage = total > 0 ? Math.round((LOA / total) * 100) : 0

    // Group by event type
    const eventTypes = [...new Set(attendanceData.map((record) => record.event))]
    const eventStats = eventTypes.map((event) => {
      const eventRecords = attendanceData.filter((record) => record.event === event)
      const eventTotal = eventRecords.length
      const eventPresent = eventRecords.filter((record) => record.status === "present").length
      const eventAbsent = eventRecords.filter((record) => record.status === "absent").length
      const eventLate = eventRecords.filter((record) => record.status === "late").length
      const eventLOA = eventRecords.filter((record) => record.status === "LOA").length

      return {
        name: event,
        present: eventPresent,
        absent: eventAbsent,
        late: eventLate,
        LOA: eventLOA,
        total: eventTotal,
        presentPercentage: eventTotal > 0 ? Math.round((eventPresent / eventTotal) * 100) : 0,
      }
    })

    return {
      total,
      present,
      absent,
      late,
      LOA,
      presentPercentage,
      absentPercentage,
      latePercentage,
      LOAPercentage,
      eventStats,
    }
  }, [attendanceData])

  // Prepare data for pie chart
  const pieData = [
    { name: "Present", value: stats.present, color: "#22c55e" },
    { name: "Absent", value: stats.absent, color: "#ef4444" },
    { name: "Late", value: stats.late, color: "#eab308" },
    { name: "LOA", value: stats.LOA, color: "#3b82f6" },
  ]

  // Get attendance status indicator
  const getAttendanceStatus = () => {
    if (stats.absentPercentage >= 30) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        text: "High Absence Rate",
        description: `${stats.absentPercentage}% absence rate is concerning.`,
        color: "text-red-500",
      }
    } else if (stats.latePercentage >= 20) {
      return {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        text: "Frequent Tardiness",
        description: `${stats.latePercentage}% late attendance needs improvement.`,
        color: "text-yellow-500",
      }
    } else {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: "Good Standing",
        description: `${stats.presentPercentage}% attendance rate is satisfactory.`,
        color: "text-green-500",
      }
    }
  }

  const status = getAttendanceStatus()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-accent mr-2" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.present}</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                {stats.presentPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.absent}</span>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                {stats.absentPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.late}</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                {stats.latePercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Status</CardTitle>
          <CardDescription>Overall attendance performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {status.icon}
            <div>
              <h4 className={`font-medium ${status.color}`}>{status.text}</h4>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{status.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Breakdown by attendance status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value} events`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance by Event Type</CardTitle>
            <CardDescription>Breakdown of attendance for each event type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.eventStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#22c55e" name="Present" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                <Bar dataKey="late" stackId="a" fill="#eab308" name="Late" />
                <Bar dataKey="LOA" stackId="a" fill="#3b82f6" name="LOA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Attendance Details</CardTitle>
          <CardDescription>Detailed breakdown by event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="pb-2 font-medium">Event Type</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Present</th>
                <th className="pb-2 font-medium">Absent</th>
                <th className="pb-2 font-medium">Late</th>
                <th className="pb-2 font-medium">LOA</th>
                <th className="pb-2 font-medium">Attendance Rate</th>
              </tr>
              </thead>
              <tbody>
              {stats.eventStats.map((event, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-zinc-700">
                  <td className="py-3">{event.name}</td>
                  <td className="py-3">{event.total}</td>
                  <td className="py-3">{event.present}</td>
                  <td className="py-3">{event.absent}</td>
                  <td className="py-3">{event.late}</td>
                  <td className="py-3">{event.LOA}</td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={`
                          ${
                        event.presentPercentage >= 80
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : event.presentPercentage >= 60
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                        `}
                    >
                      {event.presentPercentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

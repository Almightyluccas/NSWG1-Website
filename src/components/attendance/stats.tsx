"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Calendar,
  User,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { format, parseISO, isAfter, isBefore } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"
import { getAttendanceStats, getUsersForSelection } from "@/app/attendance/action"

interface AttendanceStatsProps {
  isAdmin?: boolean
}

export function AttendanceStats({ isAdmin = false }: AttendanceStatsProps) {
  const { data: session } = useSession()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(session?.user?.id || null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])

  const selectedUser = users.find((user) => user.id === selectedUserId)

  useEffect(() => {
    const loadUsers = async () => {
      if (isAdmin) {
        try {
          const userData = await getUsersForSelection()
          setUsers(userData)
        } catch (error) {
          console.error("Failed to load users:", error)
        }
      }
    }

    loadUsers()
  }, [isAdmin])

  useEffect(() => {
    const loadStats = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        const data = await getAttendanceStats(isAdmin ? selectedUserId || undefined : undefined)
        setStatsData(data)
      } catch (error) {
        console.error("Failed to load attendance stats:", error)
        setStatsData(null)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      loadStats()
    }
  }, [session, selectedUserId, isAdmin])

  if (loading) {
    return <div className="flex justify-center p-8">Loading statistics...</div>
  }

  if (!statsData) {
    return <div className="flex justify-center p-8">No attendance data available</div>
  }

  // Filter attendance data based on filters
  const filteredAttendanceData = statsData.records.filter((record: any) => {
    // Status filter
    if (filterStatus !== "all" && record.status !== filterStatus) {
      return false
    }

    // Date range filter
    const recordDate = parseISO(record.date)
    if (startDate && isBefore(recordDate, parseISO(startDate))) {
      return false
    }
    if (endDate && isAfter(recordDate, parseISO(endDate))) {
      return false
    }

    return true
  })

  // Recalculate statistics based on filtered data
  const totalEvents = filteredAttendanceData.length
  const presentCount = filteredAttendanceData.filter((record: any) => record.status === "present").length
  const absentCount = filteredAttendanceData.filter((record: any) => record.status === "absent").length
  const lateCount = filteredAttendanceData.filter((record: any) => record.status === "late").length
  const excusedCount = filteredAttendanceData.filter((record: any) => record.status === "excused").length

  const attendanceRate = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0
  const punctualityRate = totalEvents > 0 ? Math.round((presentCount / (presentCount + lateCount)) * 100) : 0

  // Get recent attendance (last 10 events)
  const recentAttendance = filteredAttendanceData
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  // Prepare chart data
  const chartData = filteredAttendanceData
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((record: any) => ({
      date: format(parseISO(record.date), "MMM dd"),
      present: record.status === "present" ? 1 : 0,
      absent: record.status === "absent" ? 1 : 0,
      late: record.status === "late" ? 1 : 0,
      excused: record.status === "excused" ? 1 : 0,
    }))

  const statusChartData = [
    { name: "Present", value: presentCount, color: "#10b981" },
    { name: "Absent", value: absentCount, color: "#ef4444" },
    { name: "Late", value: lateCount, color: "#f59e0b" },
    { name: "Excused", value: excusedCount, color: "#3b82f6" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500"
      case "absent":
        return "bg-red-500"
      case "late":
        return "bg-yellow-500"
      case "excused":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "excused":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and User Selection */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {isAdmin ? "User Selection & Filters" : "Filters & Options"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Select a user and filter their attendance records"
              : "Filter attendance records and customize view"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* User Selector for Admins */}
            {isAdmin && (
              <div>
                <Label>Select User</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between bg-transparent"
                    >
                      {selectedUser ? (
                        <div className="flex items-center gap-2 truncate">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{selectedUser.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Select user...</span>
                        </div>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.discord_username}`}
                              onSelect={() => {
                                setSelectedUserId(user.id === selectedUserId ? null : user.id)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", selectedUserId === user.id ? "opacity-100" : "opacity-0")}
                              />
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {user.discord_username} • {user.role.join(", ") || "No role"}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present Only</SelectItem>
                  <SelectItem value="absent">Absent Only</SelectItem>
                  <SelectItem value="late">Late Only</SelectItem>
                  <SelectItem value="excused">Excused Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => setShowDetailedView(!showDetailedView)} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                {showDetailedView ? "Hide Details" : "Show Details"}
              </Button>
            </div>
          </div>

          {/* Selected User Info */}
          {isAdmin && selectedUser && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {selectedUser.name} ({selectedUser.discord_username})
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {selectedUser.role.join(", ") || "No role assigned"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Events tracked</p>
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <Progress value={attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{punctualityRate}%</div>
            <Progress value={punctualityRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.thisMonthEvents}</div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Events this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution of attendance statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{presentCount}</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{lateCount}</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  {totalEvents > 0 ? Math.round((lateCount / totalEvents) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{absentCount}</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  {totalEvents > 0 ? Math.round((absentCount / totalEvents) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Excused</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{excusedCount}</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {totalEvents > 0 ? Math.round((excusedCount / totalEvents) * 100) : 0}%
                </Badge>
              </div>
            </div>

            {/* Status Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">Status Distribution Chart</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 10 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="text-sm font-medium">{record.event}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {format(parseISO(record.date), "MMM dd, yyyy")} • {record.eventType}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        record.status === "present"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : record.status === "absent"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : record.status === "late"
                              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records found</p>
                {!selectedUserId && isAdmin && (
                  <p className="text-sm mt-2">Select a user above to view their attendance records</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      {chartData.length > 0 && (
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Attendance pattern over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" strokeWidth={2} />
                <Line type="monotone" dataKey="excused" stroke="#3b82f6" name="Excused" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Records Table */}
      {showDetailedView && (
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Detailed Attendance Records</CardTitle>
            <CardDescription>
              Complete list of attendance records {startDate || endDate ? "for selected date range" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceData
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{format(parseISO(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{record.event}</TableCell>
                        <TableCell className="capitalize">{record.eventType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge
                              variant="outline"
                              className={
                                record.status === "present"
                                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                                  : record.status === "absent"
                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                    : record.status === "late"
                                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              }
                            >
                              {record.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

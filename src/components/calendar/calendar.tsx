"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parse
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Clock,
  MapPin,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  getMissionsByDateRange,
  getTrainingByDateRange,
  createOrUpdateMissionRSVP,
  createOrUpdateTrainingRSVP,
} from "@/app/calendar/action"

interface AttendanceRecord {
  date: string
  status: "present" | "absent" | "late" | "excused"
  event: string
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[]
  isAdmin?: boolean
  userId?: string
}

interface Mission {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  max_personnel?: number
  status: string
  campaign_name?: string
  rsvps: Array<{
    id: string
    userId: string
    userName: string
    status: string
    notes?: string
  }>
  attendance: Array<{
    id: string
    userId: string
    userName: string
    status: string
    notes?: string
  }>
}

interface Training {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  instructor?: string
  max_personnel?: number
  status: string
  rsvps: Array<{
    id: string
    userId: string
    userName: string
    status: string
    notes?: string
  }>
  attendance: Array<{
    id: string
    userId: string
    userName: string
    status: string
    notes?: string
  }>
}

export function AttendanceCalendar({ attendanceData, isAdmin = false, userId }: AttendanceCalendarProps) {
  const { data: session } = useSession()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [missions, setMissions] = useState<Mission[]>([])
  const [trainingRecords, setTrainingRecords] = useState<Training[]>([])
  const [loading, setLoading] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Load missions and training for the current month
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        const startDate = format(monthStart, "yyyy-MM-dd")
        const endDate = format(monthEnd, "yyyy-MM-dd")

        console.log("Loading calendar data for:", startDate, "to", endDate)

        // Load missions and training
        const [missionData, trainingData] = await Promise.all([
          getMissionsByDateRange(startDate, endDate),
          getTrainingByDateRange(startDate, endDate),
        ])

        console.log("Loaded missions:", missionData.length, missionData)
        console.log("Loaded training:", trainingData.length, trainingData)

        setMissions(missionData)
        setTrainingRecords(trainingData)
      } catch (error) {
        console.error("Failed to load calendar data:", error)
        setMissions([])
        setTrainingRecords([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentMonth, session])

  // Get calendar status for a specific date from the attendanceData prop
  const getAttendanceForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return attendanceData.filter((record) => record.date === dateString)
  }

  const getMissionsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return missions.filter((mission) => {
      const rawDate = mission.date as unknown
      let missionDateString: string
      console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

      if (typeof rawDate === "string") {
        missionDateString = format(parse(rawDate, "yyyy-MM-dd", new Date()), "yyyy-MM-dd")
      } else if (rawDate instanceof Date) {
        missionDateString = format(rawDate, "yyyy-MM-dd")
      } else {
        return false // unexpected format
      }

      return missionDateString === dateString
    })
  }

  const getTrainingForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return trainingRecords.filter((training) => {
      const rawDate = training.date as unknown
      let trainingDateString: string

      if (typeof rawDate === "string") {
        trainingDateString = format(parse(rawDate, "yyyy-MM-dd", new Date()), "yyyy-MM-dd")
      } else if (rawDate instanceof Date) {
        trainingDateString = format(rawDate, "yyyy-MM-dd")
      } else {
        return false // unexpected format
      }

      return trainingDateString === dateString
    })
  }



  // Get status color
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
        return "bg-gray-300 dark:bg-zinc-600"
    }
  }

  // Get RSVP status for a mission
  const getUserRSVPStatus = (mission: Mission) => {
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) return null
    const rsvp = mission.rsvps.find((r) => r.userId === targetUserId)
    return rsvp?.status || null
  }

  // Get calendar status for a mission
  const getUserAttendanceStatus = (mission: Mission) => {
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) return null
    const attendance = mission.attendance.find((a) => a.userId === targetUserId)
    return attendance?.status || null
  }

  // Get RSVP status for training
  const getUserTrainingRSVPStatus = (training: Training) => {
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) return null
    const rsvp = training.rsvps.find((r) => r.userId === targetUserId)
    return rsvp?.status || null
  }

  // Get calendar status for training
  const getUserTrainingAttendanceStatus = (training: Training) => {
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) return null
    const attendance = training.attendance.find((a) => a.userId === targetUserId)
    return attendance?.status || null
  }

  // Handle RSVP for missions
  const handleMissionRSVP = async (mission: Mission, status: "attending" | "not-attending" | "maybe") => {
    if (!session?.user) return

    try {
      console.log("Updating mission RSVP:", { missionId: mission.id, status })
      await createOrUpdateMissionRSVP({
        missionId: mission.id,
        status,
      })

      // Reload missions to get updated data
      const startDate = format(monthStart, "yyyy-MM-dd")
      const endDate = format(monthEnd, "yyyy-MM-dd")
      const missionData = await getMissionsByDateRange(startDate, endDate)
      setMissions(missionData)
      console.log("Mission RSVP updated successfully")
    } catch (error) {
      console.error("Failed to update mission RSVP:", error)
      alert("Failed to update RSVP. Please try again.")
    }
  }

  // Handle RSVP for training
  const handleTrainingRSVP = async (training: Training, status: "attending" | "not-attending" | "maybe") => {
    if (!session?.user) return

    try {
      console.log("Updating training RSVP:", { trainingId: training.id, status })
      await createOrUpdateTrainingRSVP({
        trainingId: training.id,
        status,
      })

      // Reload training to get updated data
      const startDate = format(monthStart, "yyyy-MM-dd")
      const endDate = format(monthEnd, "yyyy-MM-dd")
      const trainingData = await getTrainingByDateRange(startDate, endDate)
      setTrainingRecords(trainingData)
      console.log("Training RSVP updated successfully")
    } catch (error) {
      console.error("Failed to update training RSVP:", error)
      alert("Failed to update RSVP. Please try again.")
    }
  }

  const getRSVPIcon = (status: string) => {
    switch (status) {
      case "attending":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "not-attending":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "maybe":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
      default:
        return null
    }
  }

  const getRSVPBadgeColor = (status: string) => {
    switch (status) {
      case "attending":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "not-attending":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "maybe":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      default:
        return ""
    }
  }

  const getAttendanceBadgeColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "absent":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "late":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "excused":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return ""
    }
  }

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>

        <div className="rounded-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-zinc-900">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[120px]">
                <div className="space-y-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  {Math.random() > 0.7 && (
                    <div className="h-3 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  )}
                  {Math.random() > 0.8 && (
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attendance Calendar</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</div>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Debug info */}
      {/*<div className="text-xs text-gray-500 p-2 bg-gray-50 dark:bg-zinc-800 rounded">*/}
      {/*  Debug: Loaded {missions.length} missions and {trainingRecords.length} training records for{" "}*/}
      {/*  {format(currentMonth, "MMMM yyyy")}. Attendance data: {attendanceData.length} records.*/}
      {/*  {missions.length > 0 && (*/}
      {/*    <div className="mt-1">*/}
      {/*      Mission dates:{" "}*/}
      {/*      {missions*/}
      {/*        .map((m) => {*/}
      {/*          const dateStr = typeof m.date === "string" ? m.date : format(new Date(m.date), "yyyy-MM-dd")*/}
      {/*          return `${m.name}: ${dateStr}`*/}
      {/*        })*/}
      {/*        .join(", ")}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}

      <div className="rounded-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-zinc-900">
          {Array.from({ length: new Date(monthStart).getDay() }).map((_, i) => (
            <div
              key={`empty-start-${i}`}
              className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[120px]"
            />
          ))}

          {daysInMonth.map((day) => {
            const attendanceRecords = getAttendanceForDate(day)
            const dayMissions = getMissionsForDate(day)
            const dayTraining = getTrainingForDate(day)
            const isToday = isSameDay(day, new Date())
            const isPast = isPastDate(day)
            const hasEvents = attendanceRecords.length > 0 || dayMissions.length > 0 || dayTraining.length > 0

            return (
              <div
                key={day.toString()}
                className={cn(
                  "border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[120px]",
                  !isSameMonth(day, currentMonth) && "bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-500",
                  hasEvents && "bg-blue-50/30 dark:bg-blue-950/20",
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday && "bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {hasEvents && (
                    <div className="flex items-center gap-1">
                      {dayMissions.length > 0 && <CalendarIcon className="h-3 w-3 text-accent" />}
                      {dayTraining.length > 0 && <GraduationCap className="h-3 w-3 text-blue-500" />}
                      {attendanceRecords.length > 0 && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {/* Campaign missions - show ALL missions for this date */}
                  {dayMissions.map((mission, idx) => {
                    const userRSVP = getUserRSVPStatus(mission)
                    const userAttendance = getUserAttendanceStatus(mission)
                    const attendingCount = mission.rsvps.filter((r) => r.status === "attending").length
                    const maybeCount = mission.rsvps.filter((r) => r.status === "maybe").length
                    const notAttendingCount = mission.rsvps.filter((r) => r.status === "not-attending").length
                    const presentCount = mission.attendance.filter((a) => a.status === "present").length
                    const absentCount = mission.attendance.filter((a) => a.status === "absent").length
                    const lateCount = mission.attendance.filter((a) => a.status === "late").length
                    const excusedCount = mission.attendance.filter((a) => a.status === "excused").length

                    return (
                      <Popover key={`mission-${idx}`}>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded border border-accent/20 bg-accent/5">
                            <div className="flex items-center gap-1 mb-1">
                              <CalendarIcon className="w-3 h-3 text-accent" />
                              <span className="text-xs font-medium truncate text-accent">{mission.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-2 h-2" />
                              <span>{mission.time}</span>
                              {userRSVP && <div className="ml-1">{getRSVPIcon(userRSVP)}</div>}
                              {userAttendance && (
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs px-1 py-0 h-4 ml-1", getAttendanceBadgeColor(userAttendance))}
                                >
                                  {userAttendance.charAt(0).toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px]" align="start">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-accent" />
                                {mission.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{mission.description}</p>
                              {mission.campaign_name && (
                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                                  Campaign: {mission.campaign_name}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Time:</span> {mission.time}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                <Badge variant="outline" className="ml-1">
                                  {mission.status}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="font-medium">Location:</span> {mission.location}
                              </div>
                              {mission.max_personnel && (
                                <div className="col-span-2 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span className="font-medium">Max Personnel:</span> {mission.max_personnel}
                                </div>
                              )}
                            </div>

                            {/* RSVP buttons for missions (not viewing someone else and not already attended and not past date) */}
                            {!userAttendance && !isPast && (
                              <>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "attending" ? "default" : "outline"}
                                    onClick={() => handleMissionRSVP(mission, "attending")}
                                    className={userRSVP === "attending" ? "bg-green-500 hover:bg-green-600" : ""}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Attending
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "maybe" ? "default" : "outline"}
                                    onClick={() => handleMissionRSVP(mission, "maybe")}
                                    className={userRSVP === "maybe" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Maybe
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "not-attending" ? "default" : "outline"}
                                    onClick={() => handleMissionRSVP(mission, "not-attending")}
                                    className={userRSVP === "not-attending" ? "bg-red-500 hover:bg-red-600" : ""}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Can't Attend
                                  </Button>
                                </div>
                              </>
                            )}

                            {/* RSVP Summary */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">RSVP Summary</h5>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Attending: {attendingCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                  <span>Maybe: {maybeCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  <span>Can't Attend: {notAttendingCount}</span>
                                </div>
                              </div>
                            </div>

                            {/* Attendance Summary (for past events) */}
                            {isPast && mission.attendance.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Attendance Summary</h5>
                                <div className="flex gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Present: {presentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span>Absent: {absentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span>Late: {lateCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Excused: {excusedCount}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {userRSVP && (
                              <div className="text-sm">
                                <span className="font-medium">Your RSVP:</span>{" "}
                                <Badge variant="outline" className={cn(getRSVPBadgeColor(userRSVP))}>
                                  {userRSVP.replace("-", " ")}
                                </Badge>
                              </div>
                            )}

                            {userAttendance && (
                              <div className="text-sm">
                                <span className="font-medium">Your Attendance:</span>{" "}
                                <Badge variant="outline" className={cn(getAttendanceBadgeColor(userAttendance))}>
                                  {userAttendance}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  })}

                  {/* Training records - show ALL training for this date */}
                  {dayTraining.map((training, idx) => {
                    const userRSVP = getUserTrainingRSVPStatus(training)
                    const userAttendance = getUserTrainingAttendanceStatus(training)
                    const attendingCount = training.rsvps.filter((r) => r.status === "attending").length
                    const maybeCount = training.rsvps.filter((r) => r.status === "maybe").length
                    const notAttendingCount = training.rsvps.filter((r) => r.status === "not-attending").length
                    const presentCount = training.attendance.filter((a) => a.status === "present").length
                    const absentCount = training.attendance.filter((a) => a.status === "absent").length
                    const lateCount = training.attendance.filter((a) => a.status === "late").length
                    const excusedCount = training.attendance.filter((a) => a.status === "excused").length

                    return (
                      <Popover key={`training-${idx}`}>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded border border-blue-500/20 bg-blue-500/5">
                            <div className="flex items-center gap-1 mb-1">
                              <GraduationCap className="w-3 h-3 text-blue-500" />
                              <span className="text-xs font-medium truncate text-blue-500">{training.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-2 h-2" />
                              <span>{training.time}</span>
                              {userRSVP && <div className="ml-1">{getRSVPIcon(userRSVP)}</div>}
                              {userAttendance && (
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs px-1 py-0 h-4 ml-1", getAttendanceBadgeColor(userAttendance))}
                                >
                                  {userAttendance.charAt(0).toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px]" align="start">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-blue-500" />
                                {training.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{training.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Time:</span> {training.time}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                <Badge variant="outline" className="ml-1">
                                  {training.status}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="font-medium">Location:</span> {training.location}
                              </div>
                              {training.instructor && (
                                <div className="col-span-2">
                                  <span className="font-medium">Instructor:</span> {training.instructor}
                                </div>
                              )}
                              {training.max_personnel && (
                                <div className="col-span-2 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span className="font-medium">Max Personnel:</span> {training.max_personnel}
                                </div>
                              )}
                            </div>

                            {/*/!* Debug info *!/*/}
                            {/*<div className="text-xs text-gray-500 bg-gray-50 dark:bg-zinc-800 p-2 rounded">*/}
                            {/*  Debug: userId={userId}, userAttendance={userAttendance}, isPast={isPast.toString()}*/}
                            {/*  <br />*/}
                            {/*  Should show RSVP: {(!userId && !userAttendance && !isPast).toString()}*/}
                            {/*</div>*/}

                            {/* RSVP buttons for training (not viewing someone else and not already attended and not past date) */}
                            {!userAttendance && !isPast && (
                              <>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "attending" ? "default" : "outline"}
                                    onClick={() => handleTrainingRSVP(training, "attending")}
                                    className={userRSVP === "attending" ? "bg-green-500 hover:bg-green-600" : ""}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Attending
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "maybe" ? "default" : "outline"}
                                    onClick={() => handleTrainingRSVP(training, "maybe")}
                                    className={userRSVP === "maybe" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Maybe
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP === "not-attending" ? "default" : "outline"}
                                    onClick={() => handleTrainingRSVP(training, "not-attending")}
                                    className={userRSVP === "not-attending" ? "bg-red-500 hover:bg-red-600" : ""}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Can't Attend
                                  </Button>
                                </div>
                              </>
                            )}

                            {/* RSVP Summary */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">RSVP Summary</h5>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Attending: {attendingCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                  <span>Maybe: {maybeCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  <span>Can't Attend: {notAttendingCount}</span>
                                </div>
                              </div>
                            </div>

                            {/* Attendance Summary (for past events) */}
                            {isPast && training.attendance.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Attendance Summary</h5>
                                <div className="flex gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Present: {presentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span>Absent: {absentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span>Late: {lateCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Excused: {excusedCount}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* RSVP Details */}
                            {training.rsvps.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">RSVPs</h5>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {training.rsvps.map((rsvp) => {
                                    const attendanceRecord = training.attendance.find((a) => a.userId === rsvp.userId)
                                    return (
                                      <div key={rsvp.id} className="flex items-center justify-between text-sm">
                                        <span>{rsvp.userName}</span>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className={cn("text-xs", getRSVPBadgeColor(rsvp.status))}
                                          >
                                            {rsvp.status.replace("-", " ")}
                                          </Badge>
                                          {attendanceRecord && (
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-xs",
                                                getAttendanceBadgeColor(attendanceRecord.status),
                                              )}
                                            >
                                              {attendanceRecord.status}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Attendance Details (for past events) */}
                            {isPast && training.attendance.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Attendance Records</h5>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {training.attendance.map((attendance) => (
                                    <div key={attendance.id} className="flex items-center justify-between text-sm">
                                      <span>{attendance.userName}</span>
                                      <Badge
                                        variant="outline"
                                        className={cn("text-xs", getAttendanceBadgeColor(attendance.status))}
                                      >
                                        {attendance.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {userRSVP && (
                              <div className="text-sm">
                                <span className="font-medium">Your RSVP:</span>{" "}
                                <Badge variant="outline" className={cn(getRSVPBadgeColor(userRSVP))}>
                                  {userRSVP.replace("-", " ")}
                                </Badge>
                              </div>
                            )}

                            {userAttendance && (
                              <div className="text-sm">
                                <span className="font-medium">Your Attendance:</span>{" "}
                                <Badge variant="outline" className={cn(getAttendanceBadgeColor(userAttendance))}>
                                  {userAttendance}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  })}

                  {/* Regular calendar records - only show if there's actual calendar marked and no corresponding mission/training */}
                  {attendanceRecords.map((record, idx) => {
                    // Check if this calendar record corresponds to a mission or training already shown
                    const correspondingMission = dayMissions.find((m) => m.name === record.event)
                    const correspondingTraining = dayTraining.find((t) => t.name === record.event)

                    // Only show standalone calendar records (not linked to missions/training shown above)
                    if (correspondingMission || correspondingTraining) return null

                    return (
                      <div
                        key={`attendance-${idx}`}
                        className="flex items-center gap-1 p-1 rounded bg-gray-50 dark:bg-zinc-800"
                      >
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(record.status))} />
                        <span className="text-xs truncate">{record.event}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {record.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {Array.from({ length: 6 - new Date(monthEnd).getDay() }).map((_, i) => (
            <div
              key={`empty-end-${i}`}
              className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[120px]"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm">Excused</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3 h-3 text-accent" />
          <span className="text-sm">Campaign Mission</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3 h-3 text-blue-500" />
          <span className="text-sm">Training Session</span>
        </div>
      </div>
    </div>
  )
}

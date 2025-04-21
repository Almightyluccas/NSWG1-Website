"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AttendanceRecord {
  date: string
  status: "present" | "absent" | "late" | "excused"
  event: string
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[]
}

export function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Get attendance status for a specific date
  const getAttendanceForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return attendanceData.filter((record) => record.date === dateString)
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
              className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[80px]"
            />
          ))}

          {daysInMonth.map((day) => {
            const attendanceRecords = getAttendanceForDate(day)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toString()}
                className={cn(
                  "border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[80px]",
                  !isSameMonth(day, currentMonth) && "bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-500",
                )}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday && "bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {attendanceRecords.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {attendanceRecords.map((record, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(record.status))} />
                          <span className="text-xs truncate max-w-[100px]">{record.event}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {Array.from({ length: 6 - new Date(monthEnd).getDay() }).map((_, i) => (
            <div
              key={`empty-end-${i}`}
              className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[80px]"
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
      </div>
    </div>
  )
}

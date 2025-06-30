"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Plus,
  CalendarIcon,
  MapPin,
  Users,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react"
import { format } from "date-fns"
import {
  getTrainingRecords,
  createTrainingRecord,
  createOrUpdateTrainingRSVP,
  markTrainingAttendance,
} from "@/app/calendar/action"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const TRAINING_PER_PAGE = 5

interface TrainingRecord {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  instructor?: string
  max_personnel?: number
  status: string
  created_by: string
  created_at: string
  rsvps: TrainingRSVP[]
  attendance: TrainingAttendance[]
}

interface TrainingRSVP {
  id: string
  trainingId: string
  userId: string
  userName: string
  status: "attending" | "not-attending" | "maybe"
  notes?: string
  createdAt: string
  updatedAt: string
}

interface TrainingAttendance {
  id: string
  trainingId: string
  userId: string
  userName: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
  markedBy: string
  markedAt: string
}

export function TrainingTab() {
  const { data: session } = useSession()
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([])
  const [isCreateTrainingOpen, setIsCreateTrainingOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<TrainingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [collapsedTraining, setCollapsedTraining] = useState<Set<string>>(new Set())

  const isAdmin = session?.user?.roles.includes("admin")

  useEffect(() => {
    loadTrainingRecords()
  }, [session])

  const loadTrainingRecords = async () => {
    try {
      setLoading(true)
      const trainingData = await getTrainingRecords()
      setTrainingRecords(trainingData)
    } catch (error) {
      console.error("Failed to load training records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const location = formData.get("location") as string
    const instructor = formData.get("instructor") as string
    const maxPersonnel = Number.parseInt(formData.get("maxPersonnel") as string) || undefined

    try {
      await createTrainingRecord({
        name,
        description,
        date,
        time,
        location,
        instructor: instructor || undefined,
        maxPersonnel,
      })

      setIsCreateTrainingOpen(false)
      loadTrainingRecords()
    } catch (error) {
      console.error("Failed to create training:", error)
    }
  }

  const handleRSVP = async (training: TrainingRecord, status: "attending" | "not-attending" | "maybe") => {
    if (!session?.user) return

    try {
      console.log("Updating RSVP for training:", training.id, "status:", status)
      await createOrUpdateTrainingRSVP({
        trainingId: training.id,
        status,
      })

      console.log("RSVP updated, reloading training records...")
      loadTrainingRecords()
    } catch (error) {
      console.error("Failed to update RSVP:", error)
      alert("Failed to update RSVP. Please try again.")
    }
  }

  const handleMarkAttendance = async (
    training: TrainingRecord,
    userId: string,
    userName: string,
    status: "present" | "absent" | "late" | "excused",
  ) => {
    if (!session?.user) return

    try {
      await markTrainingAttendance({
        trainingId: training.id,
        userId,
        userName,
        status,
      })

      loadTrainingRecords()
    } catch (error) {
      console.error("Failed to mark calendar:", error)
    }
  }

  const toggleTrainingCollapse = (trainingId: string) => {
    const newCollapsed = new Set(collapsedTraining)
    if (newCollapsed.has(trainingId)) {
      newCollapsed.delete(trainingId)
    } else {
      newCollapsed.add(trainingId)
    }
    setCollapsedTraining(newCollapsed)
  }

  const getUserRSVP = (training: TrainingRecord): TrainingRSVP | undefined => {
    return training.rsvps.find((rsvp) => rsvp.userId === session?.user?.id)
  }

  const getUserAttendance = (training: TrainingRecord): TrainingAttendance | undefined => {
    return training.attendance.find((att) => att.userId === session?.user?.id)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-500", text: "Scheduled" },
      "in-progress": { color: "bg-yellow-500", text: "In Progress" },
      completed: { color: "bg-green-500", text: "Completed" },
      cancelled: { color: "bg-red-500", text: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }

    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>
  }

  const getRSVPIcon = (status: string) => {
    switch (status) {
      case "attending":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "not-attending":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "maybe":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(trainingRecords.length / TRAINING_PER_PAGE)
  const startIndex = (currentPage - 1) * TRAINING_PER_PAGE
  const endIndex = startIndex + TRAINING_PER_PAGE
  const paginatedTraining = trainingRecords.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="theme-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-96 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Training Records</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {startIndex + 1}-{Math.min(endIndex, trainingRecords.length)} of {trainingRecords.length} training
            sessions
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateTrainingOpen} onOpenChange={setIsCreateTrainingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent-darker text-black">
                <Plus className="h-4 w-4 mr-2" />
                Create Training
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Training Session</DialogTitle>
                <DialogDescription>Schedule a new training session for personnel.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTraining}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Training Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor (Optional)</Label>
                    <Input id="instructor" name="instructor" />
                  </div>
                  <div>
                    <Label htmlFor="maxPersonnel">Max Personnel (Optional)</Label>
                    <Input id="maxPersonnel" name="maxPersonnel" type="number" />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" className="bg-accent hover:bg-accent-darker text-black">
                    Create Training
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {paginatedTraining.map((training) => {
          const isCollapsed = collapsedTraining.has(training.id)

          return (
            <Card key={training.id} className="theme-card">
              <Collapsible>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-accent" />
                          {training.name}
                          {getStatusBadge(training.status)}
                        </CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTrainingCollapse(training.id)}
                            className="ml-auto"
                          >
                            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CardDescription>{training.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(training.date), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {training.time}
                        </span>
                        {training.instructor && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {training.instructor}
                          </span>
                        )}
                        <span>{training.rsvps.length} RSVPs</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4 text-accent" />
                                {format(new Date(training.date), "MMM dd, yyyy")}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-accent" />
                                {training.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-accent" />
                                {training.location}
                              </div>
                              {training.max_personnel && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-accent" />
                                  {training.rsvps.filter((r) => r.status === "attending").length}/
                                  {training.max_personnel}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const userRSVP = getUserRSVP(training)
                              const userAttendance = getUserAttendance(training)
                              return (
                                <>
                                  {userRSVP && getRSVPIcon(userRSVP.status)}
                                  {userAttendance && (
                                    <Badge variant={userAttendance.status === "present" ? "default" : "secondary"}>
                                      {userAttendance.status}
                                    </Badge>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </div>

                        {/* RSVP Actions */}
                        <div className="flex gap-2 mb-4">
                          {(() => {
                            const userAttendance = getUserAttendance(training)
                            const userRSVP = getUserRSVP(training)

                            if (
                              !userAttendance &&
                              (training.status === "scheduled" || training.status === "in-progress")
                            ) {
                              return (
                                <>
                                  <Button
                                    size="sm"
                                    variant={userRSVP?.status === "attending" ? "default" : "outline"}
                                    onClick={() => handleRSVP(training, "attending")}
                                    className={
                                      userRSVP?.status === "attending" ? "bg-green-500 hover:bg-green-600" : ""
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Attending
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP?.status === "maybe" ? "default" : "outline"}
                                    onClick={() => handleRSVP(training, "maybe")}
                                    className={userRSVP?.status === "maybe" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Maybe
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={userRSVP?.status === "not-attending" ? "default" : "outline"}
                                    onClick={() => handleRSVP(training, "not-attending")}
                                    className={
                                      userRSVP?.status === "not-attending" ? "bg-red-500 hover:bg-red-600" : ""
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Can't Attend
                                  </Button>
                                </>
                              )
                            }
                            return null
                          })()}

                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTraining(training)
                                setIsAttendanceModalOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Mark Attendance
                            </Button>
                          )}
                        </div>

                        {/* Personnel Lists - Visible to Everyone */}
                        {training.rsvps.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-sm">Personnel Status:</h5>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Attending */}
                              {(() => {
                                const attendingRSVPs = training.rsvps.filter((r) => r.status === "attending")
                                if (attendingRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">Attending ({attendingRSVPs.length})</span>
                                      </div>
                                      <div className="space-y-1">
                                        {attendingRSVPs.map((rsvp) => {
                                          const attendance = training.attendance.find((a) => a.userId === rsvp.userId)
                                          return (
                                            <div key={rsvp.id} className="flex items-center justify-between text-sm">
                                              <span>{rsvp.userName}</span>
                                              {attendance && (
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    attendance.status === "present"
                                                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                      : attendance.status === "absent"
                                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                        : attendance.status === "late"
                                                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                  }
                                                >
                                                  {attendance.status}
                                                </Badge>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              })()}

                              {/* Maybe */}
                              {(() => {
                                const maybeRSVPs = training.rsvps.filter((r) => r.status === "maybe")
                                if (maybeRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium">Maybe ({maybeRSVPs.length})</span>
                                      </div>
                                      <div className="space-y-1">
                                        {maybeRSVPs.map((rsvp) => (
                                          <div key={rsvp.id} className="text-sm">
                                            {rsvp.userName}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              })()}

                              {/* Not Attending */}
                              {(() => {
                                const notAttendingRSVPs = training.rsvps.filter((r) => r.status === "not-attending")
                                if (notAttendingRSVPs.length > 0) {
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium">
                                          Can't Attend ({notAttendingRSVPs.length})
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {notAttendingRSVPs.map((rsvp) => (
                                          <div key={rsvp.id} className="text-sm">
                                            {rsvp.userName}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {trainingRecords.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Training Records Available</h3>
          <p>
            {isAdmin
              ? "Create your first training session to start tracking calendar."
              : "You haven't been assigned to any training sessions yet."}
          </p>
        </div>
      )}

      {/* Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {selectedTraining?.name}</DialogTitle>
            <DialogDescription>Mark attendance for personnel who RSVPed to this training session.</DialogDescription>
          </DialogHeader>

          {selectedTraining && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personnel</TableHead>
                    <TableHead>RSVP Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTraining.rsvps.map((rsvp) => {
                    const attendance = selectedTraining.attendance.find((a) => a.userId === rsvp.userId)

                    return (
                      <TableRow key={rsvp.id}>
                        <TableCell>{rsvp.userName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRSVPIcon(rsvp.status)}
                            {rsvp.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attendance ? (
                            <Badge variant={attendance.status === "present" ? "default" : "secondary"}>
                              {attendance.status}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-zinc-400">Not marked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={attendance?.status === "present" ? "default" : "outline"}
                              onClick={() =>
                                handleMarkAttendance(selectedTraining, rsvp.userId, rsvp.userName, "present")
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "absent" ? "default" : "outline"}
                              onClick={() =>
                                handleMarkAttendance(selectedTraining, rsvp.userId, rsvp.userName, "absent")
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "late" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(selectedTraining, rsvp.userId, rsvp.userName, "late")}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "excused" ? "default" : "outline"}
                              onClick={() =>
                                handleMarkAttendance(selectedTraining, rsvp.userId, rsvp.userName, "excused")
                              }
                            >
                              Excused
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

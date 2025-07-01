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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
} from "lucide-react"
import { format } from "date-fns"
import {
  getCampaigns,
  createCampaign,
  createMission,
  createOrUpdateMissionRSVP,
  markMissionAttendance,
  updateCampaignEndDate,
} from "@/app/calendar/action"

const CAMPAIGNS_PER_PAGE = 5

interface Campaign {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  created_by: string
  created_at: string
  missions: Mission[]
}

interface Mission {
  id: string
  campaign_id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  max_personnel?: number
  status: string
  created_by: string
  created_at: string
  rsvps: RSVP[]
  attendance: AttendanceRecord[]
}

interface RSVP {
  id: string
  missionId: string
  userId: string
  userName: string
  status: "attending" | "not-attending" | "maybe"
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AttendanceRecord {
  id: string
  missionId: string
  userId: string
  userName: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
  markedBy: string
  markedAt: string
}

export function CampaignsTab() {
  const { data: session } = useSession()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [collapsedCampaigns, setCollapsedCampaigns] = useState<Set<string>>(new Set())
  const [collapsedMissions, setCollapsedMissions] = useState<Set<string>>(new Set())

  const isAdmin = session?.user?.roles.includes("admin")

  useEffect(() => {
    loadCampaigns()
  }, [session])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const campaignData = await getCampaigns()
      let campaignToDisplay = campaignData;

      if (!isAdmin) campaignToDisplay = campaignData.filter((campaign: { status: string }) => campaign.status !== "planning")
      setCampaigns(campaignToDisplay)
    } catch (error) {
      console.error("Failed to load campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string

    try {
      await createCampaign({
        name,
        description,
        startDate,
        endDate,
      })

      setIsCreateCampaignOpen(false)
      loadCampaigns()
    } catch (error) {
      console.error("Failed to create campaign:", error)
    }
  }

  const handleUpdateCampaignEndDate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCampaign) return

    const formData = new FormData(e.currentTarget)
    const endDate = formData.get("endDate") as string

    try {
      await updateCampaignEndDate(selectedCampaign.id, endDate)
      setIsEditCampaignOpen(false)
      loadCampaigns()
    } catch (error) {
      console.error("Failed to update campaign:", error)
    }
  }

  const handleCreateMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCampaign) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const location = formData.get("location") as string
    const maxPersonnel = Number.parseInt(formData.get("maxPersonnel") as string) || 40

    try {
      await createMission({
        campaignId: selectedCampaign.id,
        name,
        description,
        date,
        time,
        location,
        maxPersonnel,
      })

      setIsCreateMissionOpen(false)
      loadCampaigns()
    } catch (error) {
      console.error("Failed to create mission:", error)
    }
  }

  const handleRSVP = async (mission: Mission, status: "attending" | "not-attending" | "maybe") => {
    if (!session?.user) return

    try {
      await createOrUpdateMissionRSVP({
        missionId: mission.id,
        status,
      })

      loadCampaigns()
    } catch (error) {
      console.error("Failed to update RSVP:", error)
    }
  }

  const handleMarkAttendance = async (
    mission: Mission,
    userId: string,
    userName: string,
    status: "present" | "absent" | "late" | "excused",
  ) => {
    if (!session?.user) return

    try {
      await markMissionAttendance({
        missionId: mission.id,
        userId,
        userName,
        status,
      })

      // Close modal and reload data
      setIsAttendanceModalOpen(false)
      loadCampaigns()
    } catch (error) {
      console.error("Failed to mark calendar:", error)
    }
  }

  const toggleCampaignCollapse = (campaignId: string) => {
    const newCollapsed = new Set(collapsedCampaigns)
    if (newCollapsed.has(campaignId)) {
      newCollapsed.delete(campaignId)
    } else {
      newCollapsed.add(campaignId)
    }
    setCollapsedCampaigns(newCollapsed)
  }

  const toggleMissionCollapse = (missionId: string) => {
    const newCollapsed = new Set(collapsedMissions)
    if (newCollapsed.has(missionId)) {
      newCollapsed.delete(missionId)
    } else {
      newCollapsed.add(missionId)
    }
    setCollapsedMissions(newCollapsed)
  }

  const getUserRSVP = (mission: Mission): RSVP | undefined => {
    return mission.rsvps.find((rsvp) => rsvp.userId === session?.user?.id)
  }

  const getUserAttendance = (mission: Mission): AttendanceRecord | undefined => {
    return mission.attendance.find((att) => att.userId === session?.user?.id)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: "bg-blue-500", text: "Planning" },
      active: { color: "bg-green-500", text: "Active" },
      completed: { color: "bg-gray-500", text: "Completed" },
      scheduled: { color: "bg-blue-500", text: "Scheduled" },
      "in-progress": { color: "bg-yellow-500", text: "In Progress" },
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
  const totalPages = Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE)
  const startIndex = (currentPage - 1) * CAMPAIGNS_PER_PAGE
  const endIndex = startIndex + CAMPAIGNS_PER_PAGE
  const paginatedCampaigns = campaigns.slice(startIndex, endIndex)

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
                  <div className="flex gap-2 ml-4">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-8 w-28 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                      <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-4" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, k) => (
                          <div key={k} className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ))}
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
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {startIndex + 1}-{Math.min(endIndex, campaigns.length)} of {campaigns.length} campaigns
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent-darker text-black">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Create a new campaign to organize multiple missions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" required />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" className="bg-accent hover:bg-accent-darker text-black">
                    Create Campaign
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {paginatedCampaigns.map((campaign) => {
          const isCollapsed = collapsedCampaigns.has(campaign.id)

          return (
            <Card key={campaign.id} className="theme-card">
              <Collapsible>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="flex items-center gap-2">
                          {campaign.name}
                          {getStatusBadge(campaign.status)}
                        </CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCampaignCollapse(campaign.id)}
                            className="ml-auto"
                          >
                            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CardDescription>{campaign.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(campaign.start_date), "MMM dd")} -{" "}
                          {format(new Date(campaign.end_date), "MMM dd, yyyy")}
                        </span>
                        <span>{campaign.missions.length} missions</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setIsEditCampaignOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit End Date
                        </Button>
                        <Dialog open={isCreateMissionOpen} onOpenChange={setIsCreateMissionOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add Mission
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Mission</DialogTitle>
                              <DialogDescription>Add a new mission to {selectedCampaign?.name}.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateMission}>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="missionName">Mission Name</Label>
                                  <Input id="missionName" name="name" required />
                                </div>
                                <div>
                                  <Label htmlFor="missionDescription">Description</Label>
                                  <Textarea id="missionDescription" name="description" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="missionDate">Date</Label>
                                    <Input id="missionDate" name="date" type="date" required />
                                  </div>
                                  <div>
                                    <Label htmlFor="missionTime">Time</Label>
                                    <Input id="missionTime" name="time" type="time" required />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="missionLocation">Location</Label>
                                  <Input id="missionLocation" name="location" required />
                                </div>
                                <div>
                                  <Label htmlFor="maxPersonnel">Max Personnel (Optional)</Label>
                                  <Input id="maxPersonnel" name="maxPersonnel" type="number" />
                                </div>
                              </div>
                              <DialogFooter className="mt-6">
                                <Button type="submit" className="bg-accent hover:bg-accent-darker text-black">
                                  Create Mission
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.missions.map((mission) => {
                        const userRSVP = getUserRSVP(mission)
                        const userAttendance = getUserAttendance(mission)
                        const attendingRSVPs = mission.rsvps.filter((r) => r.status === "attending")
                        const maybeRSVPs = mission.rsvps.filter((r) => r.status === "maybe")
                        const notAttendingRSVPs = mission.rsvps.filter((r) => r.status === "not-attending")
                        const isMissionCollapsed = collapsedMissions.has(mission.id)

                        return (
                          <div key={mission.id} className="border rounded-lg p-4 border-gray-200 dark:border-zinc-700">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {mission.name}
                                    {getStatusBadge(mission.status)}
                                  </h4>
                                  <Button variant="ghost" size="sm" onClick={() => toggleMissionCollapse(mission.id)}>
                                    {isMissionCollapsed ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">{mission.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {userRSVP && getRSVPIcon(userRSVP.status)}
                                {userAttendance && (
                                  <Badge variant={userAttendance.status === "present" ? "default" : "secondary"}>
                                    {userAttendance.status}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {!isMissionCollapsed && (
                              <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4 text-accent" />
                                    {format(new Date(mission.date), "MMM dd, yyyy")}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-accent" />
                                    {mission.time}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-accent" />
                                    {mission.location}
                                  </div>
                                  {mission.max_personnel && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4 text-accent" />
                                      {attendingRSVPs.length}/{mission.max_personnel}
                                    </div>
                                  )}
                                </div>

                                {/* RSVP Actions */}
                                <div className="flex gap-2 mb-4">
                                  {!userAttendance &&
                                    (mission.status === "scheduled" || mission.status === "in-progress") && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant={userRSVP?.status === "attending" ? "default" : "outline"}
                                          onClick={() => handleRSVP(mission, "attending")}
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
                                          onClick={() => handleRSVP(mission, "maybe")}
                                          className={
                                            userRSVP?.status === "maybe" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                                          }
                                        >
                                          <AlertCircle className="h-4 w-4 mr-1" />
                                          Maybe
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={userRSVP?.status === "not-attending" ? "default" : "outline"}
                                          onClick={() => handleRSVP(mission, "not-attending")}
                                          className={
                                            userRSVP?.status === "not-attending" ? "bg-red-500 hover:bg-red-600" : ""
                                          }
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Can't Attend
                                        </Button>
                                      </>
                                    )}

                                  {isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedMission(mission)
                                        setIsAttendanceModalOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Mark Attendance
                                    </Button>
                                  )}
                                </div>

                                {/* Personnel Lists - Visible to Everyone */}
                                {mission.rsvps.length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-sm">Personnel Status:</h5>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Attending */}
                                      {attendingRSVPs.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">
                                              Attending ({attendingRSVPs.length})
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            {attendingRSVPs.map((rsvp) => {
                                              const attendance = mission.attendance.find(
                                                (a) => a.userId === rsvp.userId,
                                              )
                                              return (
                                                <div
                                                  key={rsvp.id}
                                                  className="flex items-center justify-between text-sm"
                                                >
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
                                      )}

                                      {/* Maybe */}
                                      {maybeRSVPs.length > 0 && (
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
                                      )}

                                      {/* Not Attending */}
                                      {notAttendingRSVPs.length > 0 && (
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
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}

                      {campaign.missions.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No missions scheduled for this campaign yet.</p>
                        </div>
                      )}
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

      {campaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Campaigns Available</h3>
          <p>
            {isAdmin
              ? "Create your first campaign to start organizing missions."
              : "You haven't been assigned to any campaigns yet."}
          </p>
        </div>
      )}

      {/* Edit Campaign End Date Modal */}
      <Dialog open={isEditCampaignOpen} onOpenChange={setIsEditCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign End Date</DialogTitle>
            <DialogDescription>Update the end date for {selectedCampaign?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCampaignEndDate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="endDate">New End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={selectedCampaign?.end_date} required />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="bg-accent hover:bg-accent-darker text-black">
                Update End Date
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {selectedMission?.name}</DialogTitle>
            <DialogDescription>Mark attendance for personnel who RSVPed to this mission.</DialogDescription>
          </DialogHeader>

          {selectedMission && (
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
                  {selectedMission.rsvps.map((rsvp) => {
                    const attendance = selectedMission.attendance.find((a) => a.userId === rsvp.userId)

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
                                handleMarkAttendance(selectedMission, rsvp.userId, rsvp.userName, "present")
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "absent" ? "default" : "outline"}
                              onClick={() =>
                                handleMarkAttendance(selectedMission, rsvp.userId, rsvp.userName, "absent")
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "late" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(selectedMission, rsvp.userId, rsvp.userName, "late")}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "excused" ? "default" : "outline"}
                              onClick={() =>
                                handleMarkAttendance(selectedMission, rsvp.userId, rsvp.userName, "excused")
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

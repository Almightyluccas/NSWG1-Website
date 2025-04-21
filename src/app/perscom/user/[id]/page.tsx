"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Link from "next/link"
import { AwardDetailModal } from "@/components/perscom/award-detail-modal"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useSession } from "next-auth/react"

function calculateTimeDifference(startDate: string, endDate: string | null = null) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const diffMs = end.getTime() - start.getTime()

  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))

  const remainingMs = diffMs - years * (1000 * 60 * 60 * 24 * 365.25)
  const months = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.44))

  const remainingDays = Math.floor((remainingMs - months * (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))

  let result = ""
  if (years > 0) {
    result += `${years} year${years !== 1 ? "s" : ""} `
  }
  if (months > 0 || years > 0) {
    result += `${months} month${months !== 1 ? "s" : ""} `
  }
  result += `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`

  return result.trim()
}

// Mock data for demonstration
const users = [
  {
    id: "1",
    name: "J. Rola",
    rank: "Lieutenant Commander",
    rankImage: "/placeholder.svg?height=64&width=64&text=LCDR",
    position: "Troop Commander",
    status: "Active Duty",
    avatar: "",
    unit: "TACDEVRON 2 A Troop Command",
    joinDate: "2023-05-15",
    positionDate: "2023-05-15",
    qualifications: [
      { name: "Combat Diver", date: "2023-06-20" },
      { name: "Military Freefall", date: "2023-07-10" },
      { name: "Close Quarters Combat", date: "2023-08-05" },
      { name: "Advanced Sniper", date: "2023-09-12" },
      { name: "Combat Medic", date: "2023-10-18" },
      { name: "SERE Training", date: "2023-11-25" },
      { name: "Advanced Demolitions", date: "2023-12-30" },
      { name: "Maritime Operations", date: "2024-01-15" },
      { name: "Mountain Warfare", date: "2024-02-20" },
      { name: "Winter Warfare", date: "2024-03-10" },
    ],
    awards: [
      {
        name: "Navy Cross",
        date: "2023-09-05",
        description: "For extraordinary heroism in combat operations",
        image: "/placeholder.svg?height=80&width=80&text=Navy+Cross",
        citation:
          "For extraordinary heroism while engaged in an armed conflict against enemy forces. Lieutenant Commander Rola distinguished himself by acts of gallantry and intrepidity at the risk of his life above and beyond the call of duty.",
        presentedBy: "Admiral James Holloway",
        location: "Naval Base Coronado",
        operation: "Operation Neptune Spear",
      },
      {
        name: "Silver Star",
        date: "2023-11-15",
        description: "For gallantry in action against an enemy",
        image: "/placeholder.svg?height=80&width=80&text=Silver+Star",
        citation:
          "For gallantry in action against an opposing armed force. Lieutenant Commander Rola's actions directly contributed to mission success and saved the lives of his teammates.",
        presentedBy: "Vice Admiral John Miller",
        location: "Pentagon",
        operation: "Operation Red Wings II",
      },
      {
        name: "Bronze Star",
        date: "2023-12-20",
        description: "For heroic achievement in a combat zone",
        image: "/placeholder.svg?height=80&width=80&text=Bronze+Star",
        citation:
          "For heroic achievement in connection with combat operations against the enemy. His leadership and courage under fire were instrumental to the success of the mission.",
        presentedBy: "Rear Admiral William Hayes",
        location: "USS Nimitz",
        operation: "Operation Inherent Resolve",
      },
      {
        name: "Purple Heart",
        date: "2024-01-10",
        description: "For wounds received in action",
        image: "/placeholder.svg?height=80&width=80&text=Purple+Heart",
        citation:
          "For wounds received in action against an enemy of the United States. Lieutenant Commander Rola continued to lead his team despite sustaining injuries during the operation.",
        presentedBy: "Captain Thomas Reynolds",
        location: "Walter Reed Medical Center",
        operation: "Operation Enduring Freedom",
      },
      {
        name: "Navy Commendation Medal",
        date: "2024-02-15",
        description: "For meritorious service during operations",
        image: "/placeholder.svg?height=80&width=80&text=NCM",
        citation:
          "For meritorious service while serving as Troop Commander. His exceptional leadership and tactical acumen directly contributed to operational success.",
        presentedBy: "Commander Sarah Johnson",
        location: "Naval Special Warfare Command",
        operation: "Multiple Operations",
      },
    ],
    combatRecords: [
      {
        operation: "Operation Neptune Spear",
        location: "Abbottabad, Pakistan",
        startDate: "2023-08-01",
        endDate: "2023-08-15",
        description: "Led tactical team in high-value target extraction",
      },
      {
        operation: "Operation Red Wings II",
        location: "Kunar Province, Afghanistan",
        startDate: "2023-10-05",
        endDate: "2023-10-25",
        description: "Conducted reconnaissance and surveillance operations",
      },
      {
        operation: "Operation Inherent Resolve",
        location: "Syria",
        startDate: "2023-12-01",
        endDate: "2023-12-20",
        description: "Directed special operations forces in counter-terrorism operations",
      },
      {
        operation: "Operation Enduring Freedom",
        location: "Afghanistan",
        startDate: "2024-01-05",
        endDate: "2024-01-25",
        description: "Led direct action mission against insurgent forces",
      },
    ],
    rankHistory: [
      {
        rank: "Ensign",
        date: "2018-05-20",
        unit: "Naval Academy",
        rankImage: "/placeholder.svg?height=40&width=40&text=ENS",
      },
      {
        rank: "Lieutenant Junior Grade",
        date: "2020-06-15",
        unit: "SEAL Team 3",
        rankImage: "/placeholder.svg?height=40&width=40&text=LTJG",
      },
      {
        rank: "Lieutenant",
        date: "2021-06-10",
        unit: "SEAL Team 6",
        rankImage: "/placeholder.svg?height=40&width=40&text=LT",
      },
      {
        rank: "Lieutenant Commander",
        date: "2023-01-15",
        unit: "TACDEVRON 2",
        rankImage: "/placeholder.svg?height=40&width=40&text=LCDR",
      },
    ],
    assignmentHistory: [
      { position: "Student Officer", unit: "Naval Academy", startDate: "2018-05-20", endDate: "2019-06-01" },
      { position: "Platoon Officer", unit: "SEAL Team 3", startDate: "2019-06-15", endDate: "2021-01-10" },
      { position: "Platoon Leader", unit: "SEAL Team 6", startDate: "2022-01-10", endDate: "2023-05-01" },
      { position: "Troop Commander", unit: "TACDEVRON 2", startDate: "2023-05-15", endDate: null },
    ],
  },
  {
    id: "38",
    name: "G. Luccas",
    rank: "Special Warfare Operator Second Class",
    rankImage: "/placeholder.svg?height=64&width=64&text=SO2",
    position: "Medic",
    status: "Active Duty",
    avatar: "",
    unit: "TACDEVRON 2 A Troop, Enabler Team",
    joinDate: "2023-08-20",
    positionDate: "2023-09-05",
    qualifications: [
      { name: "Combat Medic", date: "2023-09-15" },
      { name: "Basic Airborne", date: "2023-10-05" },
    ],
    awards: [
      {
        name: "Navy Achievement Medal",
        date: "2024-01-10",
        description: "For professional achievement in the superior performance of duties",
        image: "/placeholder.svg?height=80&width=80&text=NAM",
        citation:
          "For professional achievement in the superior performance of his duties. Petty Officer Luccas's exceptional medical skills and quick thinking saved the lives of three teammates during a high-risk operation.",
        presentedBy: "Commander Thomas Wilson",
        location: "Naval Base San Diego",
        operation: "Operation Inherent Resolve",
      },
      {
        name: "Combat Action Ribbon",
        date: "2023-11-20",
        description: "For active participation in ground combat operations",
        image: "/placeholder.svg?height=80&width=80&text=CAR",
        citation:
          "For active participation in ground combat operations against enemy forces. Petty Officer Luccas demonstrated exceptional courage under fire while providing critical medical care.",
        presentedBy: "Lieutenant Commander J. Rola",
        location: "Forward Operating Base, Syria",
        operation: "Operation Inherent Resolve",
      },
    ],
    combatRecords: [
      {
        operation: "Operation Inherent Resolve",
        location: "Syria",
        startDate: "2023-10-15",
        endDate: "2023-11-10",
        description: "Provided medical support during direct action mission",
      },
    ],
    rankHistory: [
      {
        rank: "Special Warfare Operator Third Class",
        date: "2022-11-05",
        unit: "BUD/S Training",
        rankImage: "/placeholder.svg?height=40&width=40&text=SO3",
      },
      {
        rank: "Special Warfare Operator Second Class",
        date: "2023-07-20",
        unit: "TACDEVRON 2",
        rankImage: "/placeholder.svg?height=40&width=40&text=SO2",
      },
    ],
    assignmentHistory: [
      { position: "Student", unit: "BUD/S Training", startDate: "2022-06-15", endDate: "2023-07-10" },
      { position: "Medic", unit: "TACDEVRON 2", startDate: "2023-08-20", endDate: null },
    ],
  },
]

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [selectedAward, setSelectedAward] = useState<any>(null)
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false)

  const { data: session } = useSession()

  const [awardsPage, setAwardsPage] = useState(1)
  const [qualificationsPage, setQualificationsPage] = useState(1)
  const [rankHistoryPage, setRankHistoryPage] = useState(1)
  const itemsPerPage = 3

  useEffect(() => {
    const fetchUser = () => {
      setTimeout(() => {
        const foundUser = users.find((u) => u.id === id)
        setUser(foundUser || null)
      }, 500)
    }
    fetchUser()
  }, [id])

  const openAwardModal = (award: any) => {
    setSelectedAward(award)
    setIsAwardModalOpen(true)
  }

  const closeAwardModal = () => {
    setIsAwardModalOpen(false)
  }

  const paginateItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    return items?.slice(startIndex, startIndex + itemsPerPage) || []
  }

  const totalAwardsPages = user?.awards ? Math.ceil(user.awards.length / itemsPerPage) : 1
  const totalQualificationsPages = user?.qualifications ? Math.ceil(user.qualifications.length / itemsPerPage) : 1
  const totalRankHistoryPages = user?.rankHistory ? Math.ceil(user.rankHistory.length / itemsPerPage) : 1

  if (!session) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">You need to be logged in to view user profiles.</p>
          <Link
            href="/login"
            className="bg-accent hover:bg-accent-darker text-black px-6 py-2 rounded-md transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
          <p className="mb-6">The requested user profile could not be found.</p>
          <Link
            href="/perscom/roster"
            className="bg-accent hover:bg-accent-darker text-black px-6 py-2 rounded-md transition-colors"
          >
            Return to Roster
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-6">
        <Link
          href="/perscom/roster"
          className="text-accent hover:text-accent-darker transition-colors flex items-center"
        >
          ← Back to Roster
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-2 border-accent">
                    <img src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border-2 border-accent">
                    <img
                      src={user.rankImage || "/placeholder.svg"}
                      alt={user.rank}
                      className="h-12 w-12 rounded-full"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-500 dark:text-zinc-400 mb-2">{user.rank}</p>
                <Badge className="bg-green-600 hover:bg-green-700 mb-4">{user.status}</Badge>
                <div className="w-full border-t border-gray-200 dark:border-zinc-700 pt-4 mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Position:</span>
                    <span className="font-medium">{user.position}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Unit:</span>
                    <span className="font-medium">{user.unit}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Time in Unit:</span>
                    <span className="font-medium">{calculateTimeDifference(user.joinDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Time in Position:</span>
                    <span className="font-medium">{calculateTimeDifference(user.positionDate)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Awards Display */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Awards</CardTitle>
              <CardDescription>Decorations and recognitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {user.awards.map((award: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="relative group">
                      <img
                        src={award.image || "/placeholder.svg"}
                        alt={award.name}
                        className="h-20 w-20 object-contain transition-transform transform group-hover:scale-110 cursor-pointer"
                        onClick={() => openAwardModal(award)}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity">
                        {award.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="awards">
            <TabsList className="w-full">
              <TabsTrigger value="awards">Award Record</TabsTrigger>
              <TabsTrigger value="combat">Combat Record</TabsTrigger>
              <TabsTrigger value="rank">Rank History</TabsTrigger>
              <TabsTrigger value="assignments">Assignment History</TabsTrigger>
              <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            </TabsList>

            <TabsContent value="awards" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Award Record</CardTitle>
                  <CardDescription>Detailed history of decorations and recognitions</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.awards.length > 0 ? (
                    <div className="space-y-4">
                      {paginateItems(user.awards, awardsPage).map((award: any, index: number) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <img
                              src={award.image || "/placeholder.svg"}
                              alt={award.name}
                              className="h-16 w-16 object-contain"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{award.name}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => openAwardModal(award)}
                                >
                                  <Info className="h-4 w-4 mr-1" /> Details
                                </Button>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-zinc-400">
                                Awarded on {new Date(award.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-zinc-300">{award.description}</p>
                        </div>
                      ))}

                      {totalAwardsPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (awardsPage > 1) setAwardsPage(awardsPage - 1)
                                }}
                                disabled={awardsPage === 1}                               />
                            </PaginationItem>

                            {Array.from({ length: totalAwardsPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={awardsPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setAwardsPage(i + 1)
                                  }} size={undefined}                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (awardsPage < totalAwardsPages) setAwardsPage(awardsPage + 1)
                                }}
                                disabled={awardsPage === totalAwardsPages}                            />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No awards recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Combat Record</CardTitle>
                  <CardDescription>Operational deployments and combat experience</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.combatRecords && user.combatRecords.length > 0 ? (
                    <div className="space-y-6">
                      {user.combatRecords.map((record: any, index: number) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 dark:border-zinc-700 pb-6 last:border-0 last:pb-0"
                        >
                          <h4 className="font-semibold text-lg mb-1">{record.operation}</h4>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
                            <div>
                              <span className="text-gray-500 dark:text-zinc-400 text-sm">Location:</span>{" "}
                              <span className="font-medium">{record.location}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-zinc-400 text-sm">Duration:</span>{" "}
                              <span className="font-medium">
                                {new Date(record.startDate).toLocaleDateString()} -{" "}
                                {new Date(record.endDate).toLocaleDateString()} (
                                {calculateTimeDifference(record.startDate, record.endDate)})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-zinc-300">{record.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No combat records available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rank" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rank History</CardTitle>
                  <CardDescription>Progression through military ranks</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.rankHistory && user.rankHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(user.rankHistory, rankHistoryPage).map((history: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                          <div className="mb-1 flex items-center gap-3">
                            <img
                              src={history.rankImage || "/placeholder.svg"}
                              alt={history.rank}
                              className="h-10 w-10 object-contain"
                            />
                            <div>
                              <h4 className="font-semibold">{history.rank}</h4>
                              <p className="text-sm">{history.unit}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-400 ml-13">
                            Promoted on {new Date(history.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No rank history recorded.</p>
                  )}

                  {totalRankHistoryPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (rankHistoryPage > 1) setRankHistoryPage(rankHistoryPage - 1)
                            }}
                            disabled={rankHistoryPage === 1}                        />
                        </PaginationItem>

                        {Array.from({ length: totalRankHistoryPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={rankHistoryPage === i + 1}
                              onClick={(e) => {
                                e.preventDefault()
                                setRankHistoryPage(i + 1)
                              }}                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (rankHistoryPage < totalRankHistoryPages) setRankHistoryPage(rankHistoryPage + 1)
                            }}
                            disabled={rankHistoryPage === totalRankHistoryPages}                      />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment History</CardTitle>
                  <CardDescription>Previous and current duty assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.assignmentHistory && user.assignmentHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {user.assignmentHistory.map((history: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                          <div className="mb-1">
                            <h4 className="font-semibold">{history.position}</h4>
                            <p className="text-sm">{history.unit}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            {new Date(history.startDate).toLocaleDateString()} -
                            {history.endDate ? new Date(history.endDate).toLocaleDateString() : " Present"} (
                            {calculateTimeDifference(history.startDate, history.endDate)})
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No assignment history recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                  <CardDescription>Specialized training and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.qualifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                      {paginateItems(user.qualifications, qualificationsPage).map((qual: any, index: number) => (
                        <div key={index} className="py-3 flex justify-between items-center">
                          <span className="font-medium">{qual.name}</span>
                          <span className="text-sm text-gray-500 dark:text-zinc-400">
                            {new Date(qual.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}

                      {totalQualificationsPages > 1 && (
                        <Pagination className="mt-6 pt-4 border-t-0">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (qualificationsPage > 1) setQualificationsPage(qualificationsPage - 1)
                                }}
                                disabled={qualificationsPage === 1}                            />
                            </PaginationItem>

                            {Array.from({ length: totalQualificationsPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={qualificationsPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setQualificationsPage(i + 1)
                                  }}                                 >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (qualificationsPage < totalQualificationsPages)
                                    setQualificationsPage(qualificationsPage + 1)
                                }}
                                disabled={qualificationsPage === totalQualificationsPages}                             />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No qualifications recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Award Detail Modal */}
      <AwardDetailModal isOpen={isAwardModalOpen} onClose={closeAwardModal} award={selectedAward} />
    </div>
  )
}


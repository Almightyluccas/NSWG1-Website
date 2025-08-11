"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Info} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink, PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {AwardDetailModal} from "@/components/perscom/award-detail-modal";
import {PerscomUserResponse} from "@/types/perscomApi";
import {useState} from "react";
import Image from "next/image";
import { sanitizeHtmlClient } from "@/lib/sanitize/sanitizeHtmlClient";

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

interface UserProfileProps {
  user: PerscomUserResponse
  awardImages: { id: number; imageUrl: string | null; name: string }[]
  rankImage: { id: number; imageUrl: string | null; name: string } | null
  qualificationData: { id: number; name: string; received: string }[]
  rankHistory: { id: number; recordId: number; imageUrl: string | null; name: string; date: string; text: string }[]
  assignmentHistory: {
    id: number;
    unitId: number;
    positionId: number;
    unitName: string;
    positionName: string;
    date: string;
    text: string;
    type: string
  }[]
  combatHistory: {
    id: number;
    date: string;
    text: string;
    author: number;
    documentParsed: string | null;
  }[]
}

export const UserProfile = ({
  user, awardImages, rankImage, qualificationData, rankHistory, assignmentHistory, combatHistory
}: UserProfileProps) => {

  const [selectedAward, setSelectedAward] = useState<any>(null)
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false)
  const [awardsPage, setAwardsPage] = useState(1)
  const [qualificationsPage, setQualificationsPage] = useState(1)
  const [rankHistoryPage, setRankHistoryPage] = useState(1)
  const [combatPage, setCombatPage] = useState(1)
  const [assignmentPage, setAssignmentPage] = useState(1)
  const itemsPerPage = 10;



  const awardRecords = user.award_records || []
  const qualificationRecords = user.qualification_records || []



  const openAwardModal = (record: any) => {
    const awardImage = awardImages.find(img => img.id === record.award_id);
    const awardDetails = {
      ...record,
      imageUrl: awardImage?.imageUrl || "/placeholder.svg",
      name: awardImage?.name || "Unknown Award",
      sanitizedText: sanitizeHtmlClient(record.text),
      formattedDate: new Date(record.created_at).toLocaleDateString()
    };
    setSelectedAward(awardDetails);
    setIsAwardModalOpen(true);
  }

  const closeAwardModal = () => {
    setIsAwardModalOpen(false);
  }

  const paginateItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items?.slice(startIndex, startIndex + itemsPerPage) || [];
  }

  const totalAwardsPages = Math.ceil(awardRecords.length / itemsPerPage) || 1;
  const totalQualificationsPages = Math.ceil(qualificationRecords.length / itemsPerPage) || 1;
  const totalRankHistoryPages = Math.ceil(rankHistory.length / itemsPerPage) || 1;
  const totalAssignmentPages = Math.ceil(assignmentHistory.length / itemsPerPage) || 1
  const totalCombatPages = Math.ceil((combatHistory?.length || 0) / itemsPerPage) || 1

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-2 border-accent">
                    <AvatarImage src={user.profile_photo_url } alt={user.name} />
                    {/*<Image*/}
                    {/*  src={user.profile_photo_url }*/}
                    {/*  alt={user.name}*/}
                    {/*  className="h-32 w-32 rounded-full object-cover"*/}
                    {/*  width={48}*/}
                    {/*  height={48}*/}
                    {/*/>*/}
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border-2 border-accent">
                    <Image
                      src={rankImage?.imageUrl || '/placeholder.svg'}
                      alt={user.rank?.name || "Unknown"}
                      className="h-12 w-12 rounded-full"
                      width={68}
                      height={68}
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-500 dark:text-zinc-400 mb-2">{user.rank?.name || "Unknown"}</p>
                <Badge className="bg-green-600 hover:bg-green-700 mb-4">{user.status?.name || "Unknown"}</Badge>
                <div className="w-full border-t border-gray-200 dark:border-zinc-700 pt-4 mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Position:</span>
                    <span className="font-medium">{user.position?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Unit:</span>
                    <span className="font-medium">{user.unit?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Time in Service:</span>
                    <span className="font-medium">{calculateTimeDifference(user.created_at)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-zinc-400">Time in Grade:</span>
                    <span className="font-medium">{calculateTimeDifference(user.last_rank_change_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Time in Position:</span>
                    <span className="font-medium">{user.last_assignment_change_date ? calculateTimeDifference(user.last_assignment_change_date) : "Unknown"}</span>
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
                {awardRecords.length > 0 ? (
                  awardRecords.map((record, index) => {
                    const awardImage = awardImages.find(img => img.id === record.award_id);
                    return (
                      <div key={index} className="text-center">
                        <div className="relative group">
                          <Image
                            src={awardImage?.imageUrl || "/placeholder.svg"}
                            alt="Award"
                            className="h-20 w-20 object-contain transition-transform transform group-hover:scale-110 cursor-pointer"
                            width={80}
                            height={80}
                            onClick={() => openAwardModal(record)}
                          />
                          <div className="opacity-0 group-hover:opacity-100 absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity">
                            {awardImage?.name}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-zinc-400">No awards recorded.</p>
                )}
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
                  {awardRecords.length > 0 ? (
                    <div className="space-y-4">
                      {paginateItems(awardRecords, awardsPage).map((record, index) => {
                        const awardImage = awardImages.find(img => img.id === record.award_id);
                        return (
                          <div
                            key={index}
                            className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-4 mb-2">
                              <Image
                                src={awardImage?.imageUrl || "/placeholder.svg"}
                                alt="Award"
                                className="h-16 w-16 object-contain"
                                width={64}
                                height={64}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold">{awardImage?.name}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => openAwardModal(record)}
                                  >
                                    <Info className="h-4 w-4 mr-1" /> Details
                                  </Button>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-zinc-400">
                                  Awarded on {new Date(record.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-zinc-300 line-clamp-2">{sanitizeHtmlClient(record.text) || "No description available."}</p>
                          </div>
                        );
                      })}

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
                                disabled={awardsPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalAwardsPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={awardsPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setAwardsPage(i + 1)
                                  }}
                                >
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
                                disabled={awardsPage === totalAwardsPages}
                              />
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
                  <CardTitle>Combat Records</CardTitle>
                  <CardDescription>Record of combat deployments and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {combatHistory && combatHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(combatHistory, combatPage).map((record, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                          <div className="mb-1">
                            <h4 className="font-semibold">Combat Record</h4>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            Recorded on {record.date}
                          </p>
                          {record.text && (
                            <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">{sanitizeHtmlClient(record.text)}</p>
                          )}
                        </div>
                      ))}

                      {totalCombatPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (combatPage > 1) setCombatPage(combatPage - 1)
                                }}
                                disabled={combatPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalCombatPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={combatPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setCombatPage(i + 1)
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (combatPage < totalCombatPages) setCombatPage(combatPage + 1)
                                }}
                                disabled={combatPage === totalCombatPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No combat records recorded.</p>
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
                  {rankHistory && rankHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(rankHistory, rankHistoryPage).map((record, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                          <div className="flex items-center mb-1">
                            <Image
                              src={record.imageUrl || "/placeholder.svg"}
                              alt={record.name}
                              className="h-12 w-12 mr-4 object-contain"
                              width={48}
                              height={48}
                            />
                            <div>
                              <h4 className="font-semibold">{record.name}</h4>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            Promoted on {record.date}
                          </p>
                          {record.text && (
                            <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">{sanitizeHtmlClient(record.text)}</p>
                          )}
                        </div>
                      ))}

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
                                disabled={rankHistoryPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalRankHistoryPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={rankHistoryPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setRankHistoryPage(i + 1)
                                  }}
                                >
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
                                disabled={rankHistoryPage === totalRankHistoryPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No rank history recorded.</p>
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
                  {assignmentHistory && assignmentHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(assignmentHistory, assignmentPage).map((record, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                          <div className="mb-1">
                            <h4 className="font-semibold">{record.positionName}</h4>
                            <p className="text-sm">{record.unitName}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            Assigned on {record.date}
                          </p>
                          {record.text && (
                            <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">{sanitizeHtmlClient(record.text)}</p>
                          )}
                        </div>
                      ))}

                      {totalAssignmentPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (assignmentPage > 1) setAssignmentPage(assignmentPage - 1)
                                }}
                                disabled={assignmentPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalAssignmentPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={assignmentPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setAssignmentPage(i + 1)
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (assignmentPage < totalAssignmentPages) setAssignmentPage(assignmentPage + 1)
                                }}
                                disabled={assignmentPage === totalAssignmentPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
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
                  {qualificationRecords && qualificationRecords.length > 0 ? (
                    <>
                      {/* Qualification badges gallery */}
                      {/*<div className="flex flex-wrap justify-center gap-4 mb-6">*/}
                      {/*  {qualificationData.map((qualification, index) => (*/}
                      {/*    <div key={index} className="text-center">*/}
                      {/*      <div className="relative group">*/}
                      {/*        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700">*/}
                      {/*          <span className="font-medium text-sm">{qualification.name}</span>*/}
                      {/*        </div>*/}
                      {/*        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity">*/}
                      {/*          {qualification.name}*/}
                      {/*        </div>*/}
                      {/*      </div>*/}
                      {/*    </div>*/}
                      {/*  ))}*/}
                      {/*</div>*/}

                      {/* Qualification records list */}
                      <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {paginateItems(qualificationRecords, qualificationsPage).map((record, index) => {
                          const qualification = qualificationData.find(q => q.id === record.qualification_id);
                          return (
                            <div key={index} className="py-3 flex justify-between items-center">
                              <span className="font-medium">
                                {qualification?.name || `Qualification ID: ${record.qualification_id}`}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-zinc-400">
                                Received on {new Date(record.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
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
                                disabled={qualificationsPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalQualificationsPages }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={qualificationsPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setQualificationsPage(i + 1)
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (qualificationsPage < totalQualificationsPages) setQualificationsPage(qualificationsPage + 1)
                                }}
                                disabled={qualificationsPage === totalQualificationsPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">No qualifications recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AwardDetailModal isOpen={isAwardModalOpen} onClose={closeAwardModal} award={selectedAward} />
    </>
  )
}
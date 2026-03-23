"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Info, Bell, Calendar, ClipboardList, FileText, Users, Target, CalendarDays, FolderOpen } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AwardDetailModal } from "@/components/perscom/award-detail-modal";
import { PerscomUserResponse } from "@/types/api/perscomApi";
import { useState } from "react";
import Image from "next/image";
import { sanitizeHtmlClient } from "@/lib/sanitize/sanitizeHtmlClient";

function calculateTimeDifference(
  startDate: string,
  endDate: string | null = null
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffMs = end.getTime() - start.getTime();

  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));

  const remainingMs = diffMs - years * (1000 * 60 * 60 * 24 * 365.25);
  const months = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.44));

  const remainingDays = Math.floor(
    (remainingMs - months * (1000 * 60 * 60 * 24 * 30.44)) /
      (1000 * 60 * 60 * 24)
  );

  let result = "";
  if (years > 0) {
    result += `${years} year${years !== 1 ? "s" : ""} `;
  }
  if (months > 0 || years > 0) {
    result += `${months} month${months !== 1 ? "s" : ""} `;
  }
  result += `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;

  return result.trim();
}

interface UserProfileProps {
  user: PerscomUserResponse;
  awardImages: { id: number; imageUrl: string | null; name: string }[];
  rankImage: { id: number; imageUrl: string | null; name: string } | null;
  qualificationData: { id: number; name: string; received: string }[];
  rankHistory: {
    id: number;
    recordId: number;
    imageUrl: string | null;
    name: string;
    date: string;
    text: string;
  }[];
  assignmentHistory: {
    id: number;
    unitId: number;
    positionId: number;
    unitName: string;
    positionName: string;
    date: string;
    text: string;
    type: string;
  }[];
  combatHistory: {
    id: number;
    date: string;
    text: string;
    author: number;
    documentParsed: string | null;
  }[];
}

export const UserProfile = ({
  user,
  awardImages,
  rankImage,
  qualificationData,
  rankHistory,
  assignmentHistory,
  combatHistory,
}: UserProfileProps) => {
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardsPage, setAwardsPage] = useState(1);
  const [qualificationsPage, setQualificationsPage] = useState(1);
  const [rankHistoryPage, setRankHistoryPage] = useState(1);
  const [combatPage, setCombatPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const itemsPerPage = 10;

  const awardRecords = user.award_records || [];
  const qualificationRecords = user.qualification_records || [];

  const openAwardModal = (record: any) => {
    const awardImage = awardImages.find((img) => img.id === record.award_id);
    const awardDetails = {
      ...record,
      imageUrl: awardImage?.imageUrl || "/placeholder.svg",
      name: awardImage?.name || "Unknown Award",
      sanitizedText: sanitizeHtmlClient(record.text),
      formattedDate: new Date(record.created_at).toLocaleDateString(),
    };
    setSelectedAward(awardDetails);
    setIsAwardModalOpen(true);
  };

  const closeAwardModal = () => {
    setIsAwardModalOpen(false);
  };

  const paginateItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items?.slice(startIndex, startIndex + itemsPerPage) || [];
  };

  const totalAwardsPages = Math.ceil(awardRecords.length / itemsPerPage) || 1;
  const totalQualificationsPages =
    Math.ceil(qualificationRecords.length / itemsPerPage) || 1;
  const totalRankHistoryPages =
    Math.ceil(rankHistory.length / itemsPerPage) || 1;
  const totalAssignmentPages =
    Math.ceil(assignmentHistory.length / itemsPerPage) || 1;
  const totalCombatPages =
    Math.ceil((combatHistory?.length || 0) / itemsPerPage) || 1;

  return (
    <>
      <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 rounded-sm p-6 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }}
        />
        
        {/* Profile Picture */}
        <div className="relative z-10 w-32 h-32 rounded-sm border-2 border-accent overflow-hidden shrink-0 shadow-[0_0_15px_rgba(var(--accent-color),0.3)]">
          <Image src={user.profile_photo_url || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
        </div>
        
        {/* User Info */}
        <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Fake ID */}
          <div className="text-accent text-xs font-mono tracking-widest uppercase mb-2 flex items-center gap-2">
            <span>OP-ID // {user.id.toString().padStart(6, '0')}</span>
            <div className="h-1.5 w-1.5 bg-accent/80 rounded-full animate-pulse" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-white mb-4 drop-shadow-md">{user.name}</h1>
          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
             {/* Rank */}
             <div className="flex items-center gap-2 bg-zinc-800/80 px-4 py-2 rounded-sm border border-zinc-700/60 shadow-inner">
               <Image src={rankImage?.imageUrl || "/placeholder.svg"} alt={rankImage?.name || "UNASSIGNED"} width={24} height={24} className="object-contain" />
               <span className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">{user.rank?.name || "UNASSIGNED"}</span>
             </div>
             
             {/* Unit & Position */}
             <div className="bg-zinc-800/80 px-4 py-2 rounded-sm border border-zinc-700/60 shadow-inner">
               <span className="text-sm text-zinc-300 tracking-wide uppercase"><span className="text-accent font-semibold">{user.unit?.name || "UNASSIGNED"}</span> // {user.position?.name || "UNASSIGNED"}</span>
             </div>
             
             {/* Status */}
             <Badge className="bg-green-600/10 text-green-400 border border-green-500/30 px-3 py-1.5 font-mono uppercase tracking-widest text-xs">
               {user.status?.name || "ACTIVE"}
             </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Alerts & Comms */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="bg-zinc-900/60 border-zinc-700/50 backdrop-blur-md shadow-lg h-full rounded-sm">
            <CardHeader className="border-b border-zinc-800/80 pb-3 p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-mono text-zinc-100 uppercase tracking-widest">
                <Bell className="h-4 w-4 text-accent" />
                Alert Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Simulated Alerts */}
              <div className="bg-red-950/20 border-l-2 border-red-500/80 p-3 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-bl-full" />
                <p className="text-[10px] font-mono text-red-400 mb-1 opacity-80">PRIORITY MESSAGE</p>
                <p className="text-sm text-zinc-300">Mandatory FTX briefing at 2000 EST this Saturday.</p>
              </div>
              <div className="bg-zinc-800/40 border-l-2 border-accent/80 p-3 rounded-sm">
                <p className="text-[10px] font-mono text-accent mb-1 opacity-80">SYSTEM UPDATE</p>
                <p className="text-sm text-zinc-300">New qualifications matrix published. Validate records.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle Column: Command Center */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Quick Access */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/calendar">
              <div className="bg-zinc-900/60 border border-zinc-700/50 hover:border-accent/50 hover:bg-zinc-800 p-4 rounded-sm flex flex-col items-center justify-center gap-3 transition-colors group cursor-pointer h-24 shadow-md">
                 <Calendar className="h-6 w-6 text-zinc-400 group-hover:text-accent transition-colors" />
                 <span className="text-[10px] font-mono uppercase font-semibold tracking-widest text-zinc-300 group-hover:text-zinc-100">Calendar</span>
              </div>
            </Link>
            <Link href="/perscom/roster">
              <div className="bg-zinc-900/60 border border-zinc-700/50 hover:border-accent/50 hover:bg-zinc-800 p-4 rounded-sm flex flex-col items-center justify-center gap-3 transition-colors group cursor-pointer h-24 shadow-md">
                 <Users className="h-6 w-6 text-zinc-400 group-hover:text-accent transition-colors" />
                 <span className="text-[10px] font-mono uppercase font-semibold tracking-widest text-zinc-300 group-hover:text-zinc-100">Roster</span>
              </div>
            </Link>
            <Link href="/forms">
              <div className="bg-zinc-900/60 border border-zinc-700/50 hover:border-accent/50 hover:bg-zinc-800 p-4 rounded-sm flex flex-col items-center justify-center gap-3 transition-colors group cursor-pointer h-24 shadow-md">
                 <ClipboardList className="h-6 w-6 text-zinc-400 group-hover:text-accent transition-colors" />
                 <span className="text-[10px] font-mono uppercase font-semibold tracking-widest text-zinc-300 group-hover:text-zinc-100">Forms</span>
              </div>
            </Link>
            <Link href="/documents">
              <div className="bg-zinc-900/60 border border-zinc-700/50 hover:border-accent/50 hover:bg-zinc-800 p-4 rounded-sm flex flex-col items-center justify-center gap-3 transition-colors group cursor-pointer h-24 shadow-md">
                 <FileText className="h-6 w-6 text-zinc-400 group-hover:text-accent transition-colors" />
                 <span className="text-[10px] font-mono uppercase font-semibold tracking-widest text-zinc-300 group-hover:text-zinc-100">Docs</span>
              </div>
            </Link>
          </div>
          
          {/* Assigned Tasks / Directives */}
          <Card className="bg-zinc-900/60 border-zinc-700/50 backdrop-blur-md flex-1 rounded-sm shadow-lg">
            <CardHeader className="border-b border-zinc-800/80 pb-3 p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-mono text-zinc-100 uppercase tracking-widest">
                <Target className="h-4 w-4 text-accent" />
                Active Directives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
               {/* Simulated tasks */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-800/40 p-3 border border-zinc-700/50 rounded-sm gap-2">
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                   <span className="text-sm text-zinc-200">Complete Basic Flight Training (BFT)</span>
                 </div>
                 <Badge variant="outline" className="text-[10px] font-mono border-zinc-600 text-zinc-400 w-fit">PENDING</Badge>
               </div>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-800/40 p-3 border border-zinc-700/50 rounded-sm gap-2">
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-zinc-600" />
                   <span className="text-sm text-zinc-400 line-through">Submit Enlistment Application</span>
                 </div>
                 <Badge variant="outline" className="text-[10px] font-mono border-green-900/50 text-green-500 w-fit">COMPLETED</Badge>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Mini Calendar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <Card className="bg-zinc-900/60 border-zinc-700/50 backdrop-blur-md h-full rounded-sm shadow-lg">
            <CardHeader className="border-b border-zinc-800/80 pb-3 p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-mono text-zinc-100 uppercase tracking-widest">
                <CalendarDays className="h-4 w-4 text-accent" />
                Upcoming Ops
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               {/* Placeholder for small calendar/events */}
               <div className="border border-zinc-700/50 rounded-sm bg-zinc-800/30 p-3 hover:bg-zinc-800/60 transition-colors group">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="font-semibold text-zinc-100 group-hover:text-accent transition-colors text-sm">Operation Red Dawn</h4>
                     <p className="text-[10px] text-zinc-400 font-mono mt-0.5">2026-03-21 @ 2000 EST</p>
                   </div>
                   <Badge className="bg-accent/10 hover:bg-accent/20 text-accent border-accent/20 text-[10px] px-1.5 py-0">MANDATORY</Badge>
                 </div>
                 <Button size="sm" className="w-full bg-zinc-800 border border-zinc-700 hover:bg-accent hover:border-accent text-zinc-100 hover:text-black font-mono text-xs mt-3 h-8 transition-all">
                   RSVP PENDING
                 </Button>
               </div>
               
               <div className="border border-zinc-700/50 rounded-sm bg-zinc-800/30 p-3 hover:bg-zinc-800/60 transition-colors group">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="font-semibold text-zinc-100 group-hover:text-accent transition-colors text-sm">Squad Training</h4>
                     <p className="text-[10px] text-zinc-400 font-mono mt-0.5">2026-03-24 @ 1900 EST</p>
                   </div>
                   <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] px-1.5 py-0">OPTIONAL</Badge>
                 </div>
                 <Button size="sm" className="w-full bg-zinc-800 border border-zinc-700 hover:bg-accent hover:border-accent text-zinc-300 hover:text-black font-mono text-xs mt-3 h-8 transition-all">
                   RSVP PENDING
                 </Button>
               </div>
            </CardContent>
           </Card>
        </div>
      </div>

      {/* Bottom Section: Existing Tabs (Personnel File) */}
      <div className="mt-8">
        <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-3">
          <FolderOpen className="h-5 w-5 text-accent" />
          Personnel File
        </h3>
        <div className="bg-zinc-900/40 p-1 rounded-sm border border-zinc-800/50">
          <Tabs defaultValue="awards" className="w-full">
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
                  <CardDescription>
                    Detailed history of decorations and recognitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {awardRecords.length > 0 ? (
                    <div className="space-y-4">
                      {paginateItems(awardRecords, awardsPage).map(
                        (record, index) => {
                          const awardImage = awardImages.find(
                            (img) => img.id === record.award_id
                          );
                          return (
                            <div
                              key={index}
                              className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center gap-4 mb-2">
                                <Image
                                  src={
                                    awardImage?.imageUrl || "/placeholder.svg"
                                  }
                                  alt="Award"
                                  className="h-16 w-16 object-contain"
                                  width={64}
                                  height={64}
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">
                                      {awardImage?.name}
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                      onClick={() => openAwardModal(record)}
                                    >
                                      <Info className="h-4 w-4 mr-1" /> Details
                                    </Button>
                                  </div>
                                  <span className="text-sm text-zinc-400">
                                    Awarded on{" "}
                                    {new Date(
                                      record.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-zinc-300 line-clamp-2">
                                {sanitizeHtmlClient(record.text) ||
                                  "No description available."}
                              </p>
                            </div>
                          );
                        }
                      )}

                      {totalAwardsPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (awardsPage > 1)
                                    setAwardsPage(awardsPage - 1);
                                }}
                                disabled={awardsPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalAwardsPages }).map(
                              (_, i) => (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    href="#"
                                    isActive={awardsPage === i + 1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setAwardsPage(i + 1);
                                    }}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (awardsPage < totalAwardsPages)
                                    setAwardsPage(awardsPage + 1);
                                }}
                                disabled={awardsPage === totalAwardsPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">
                      No awards recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Combat Records</CardTitle>
                  <CardDescription>
                    Record of combat deployments and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {combatHistory && combatHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(combatHistory, combatPage).map(
                        (record, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                            <div className="mb-1">
                              <h4 className="font-semibold text-zinc-100">Combat Record</h4>
                            </div>
                            <p className="text-sm text-zinc-400">
                              Recorded on {record.date}
                            </p>
                            {record.text && (
                              <p className="text-sm text-zinc-300 mt-1">
                                {sanitizeHtmlClient(record.text)}
                              </p>
                            )}
                          </div>
                        )
                      )}

                      {totalCombatPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (combatPage > 1)
                                    setCombatPage(combatPage - 1);
                                }}
                                disabled={combatPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalCombatPages }).map(
                              (_, i) => (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    href="#"
                                    isActive={combatPage === i + 1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCombatPage(i + 1);
                                    }}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (combatPage < totalCombatPages)
                                    setCombatPage(combatPage + 1);
                                }}
                                disabled={combatPage === totalCombatPages}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">
                      No combat records recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rank" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rank History</CardTitle>
                  <CardDescription>
                    Progression through military ranks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rankHistory && rankHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(rankHistory, rankHistoryPage).map(
                        (record, index) => (
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
                                <h4 className="font-semibold text-zinc-100">{record.name}</h4>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-400">
                              Promoted on {record.date}
                            </p>
                            {record.text && (
                              <p className="text-sm text-zinc-300 mt-1">
                                {sanitizeHtmlClient(record.text)}
                              </p>
                            )}
                          </div>
                        )
                      )}

                      {totalRankHistoryPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (rankHistoryPage > 1)
                                    setRankHistoryPage(rankHistoryPage - 1);
                                }}
                                disabled={rankHistoryPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalRankHistoryPages }).map(
                              (_, i) => (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    href="#"
                                    isActive={rankHistoryPage === i + 1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setRankHistoryPage(i + 1);
                                    }}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (rankHistoryPage < totalRankHistoryPages)
                                    setRankHistoryPage(rankHistoryPage + 1);
                                }}
                                disabled={
                                  rankHistoryPage === totalRankHistoryPages
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">
                      No rank history recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment History</CardTitle>
                  <CardDescription>
                    Previous and current duty assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignmentHistory && assignmentHistory.length > 0 ? (
                    <div className="relative border-l-2 border-accent pl-6 ml-2 space-y-6">
                      {paginateItems(assignmentHistory, assignmentPage).map(
                        (record, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-accent"></div>
                            <div className="mb-1">
                              <h4 className="font-semibold text-zinc-100">
                                {record.positionName}
                              </h4>
                              <p className="text-sm text-zinc-300">{record.unitName}</p>
                            </div>
                            <p className="text-sm text-zinc-400">
                              Assigned on {record.date}
                            </p>
                            {record.text && (
                              <p className="text-sm text-zinc-300 mt-1">
                                {sanitizeHtmlClient(record.text)}
                              </p>
                            )}
                          </div>
                        )
                      )}

                      {totalAssignmentPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (assignmentPage > 1)
                                    setAssignmentPage(assignmentPage - 1);
                                }}
                                disabled={assignmentPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalAssignmentPages }).map(
                              (_, i) => (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    href="#"
                                    isActive={assignmentPage === i + 1}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setAssignmentPage(i + 1);
                                    }}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (assignmentPage < totalAssignmentPages)
                                    setAssignmentPage(assignmentPage + 1);
                                }}
                                disabled={
                                  assignmentPage === totalAssignmentPages
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">
                      No assignment history recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                  <CardDescription>
                    Specialized training and certifications
                  </CardDescription>
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
                        {paginateItems(
                          qualificationRecords,
                          qualificationsPage
                        ).map((record, index) => {
                          const qualification = qualificationData.find(
                            (q) => q.id === record.qualification_id
                          );
                          return (
                            <div
                              key={index}
                              className="py-3 flex justify-between items-center"
                            >
                              <span className="font-medium text-zinc-100">
                                {qualification?.name ||
                                  `Qualification ID: ${record.qualification_id}`}
                              </span>
                              <span className="text-sm text-zinc-400">
                                Received on{" "}
                                {new Date(
                                  record.created_at
                                ).toLocaleDateString()}
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
                                  e.preventDefault();
                                  if (qualificationsPage > 1)
                                    setQualificationsPage(
                                      qualificationsPage - 1
                                    );
                                }}
                                disabled={qualificationsPage === 1}
                              />
                            </PaginationItem>

                            {Array.from({
                              length: totalQualificationsPages,
                            }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={qualificationsPage === i + 1}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setQualificationsPage(i + 1);
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
                                  e.preventDefault();
                                  if (
                                    qualificationsPage <
                                    totalQualificationsPages
                                  )
                                    setQualificationsPage(
                                      qualificationsPage + 1
                                    );
                                }}
                                disabled={
                                  qualificationsPage ===
                                  totalQualificationsPages
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-zinc-400">
                      No qualifications recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

      <AwardDetailModal
        isOpen={isAwardModalOpen}
        onClose={closeAwardModal}
        award={selectedAward}
      />
    </>
  );
};

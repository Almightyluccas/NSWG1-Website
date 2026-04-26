"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Crosshair,
  Clock,
  Shield,
  FileText,
  Download,
  Terminal,
  Database,
  Users,
  Wifi,
  Target,
} from "lucide-react";
import Link from "next/link";
import { getClassification } from "@/lib/config/operations";
import { type MockOperation } from "@/types/operations";
import { Skeleton } from "@/components/ui/skeleton";
import { AarSection } from "@/components/operations/aar-section";
import { groupPersonnel, UNIT_GROUP } from "@/lib/config/personnel-groups";
import { UserRole } from "@/types/database";

type ScopedSseItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  classification: string;
  status: string;
  imageUrl: string;
  collectedDate: string;
};

type OperationDocItem = {
  id: string;
  title: string;
  description: string;
  docType: string;
  classification: string;
  fileUrl: string;
  date: string;
};

export function OperationDetailClient({
  id,
  userRoles = [],
}: {
  id: string;
  userRoles?: string[];
}) {
  const [opData, setOpData] = useState<MockOperation | null>(null);
  const [sseItems, setSseItems] = useState<ScopedSseItem[]>([]);
  const [docs, setDocs] = useState<OperationDocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOp() {
      try {
        const res = await fetch("/api/operations");
        const data: MockOperation[] = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((op) => op.id === id);
          setOpData(found ?? data[0] ?? null);
        } else {
          setOpData(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOp();
  }, [id]);

  useEffect(() => {
    const loadSse = async () => {
      try {
        const res = await fetch(`/api/sse?campaignId=${id}&status=RELEASED`);
        if (!res.ok) throw new Error("Failed to load SSE.");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSseItems(
            data.map((item: any) => ({
              id: String(item.id),
              title: String(item.name ?? "Unnamed"),
              description: String(item.description ?? ""),
              type: String(item.type ?? "OTHER"),
              classification: String(item.classification ?? "UNCLASSIFIED"),
              status: String(item.status ?? "LOGGED"),
              imageUrl: String(item.image_url ?? ""),
              collectedDate: String(item.collected_date ?? ""),
            }))
          );
          return;
        }
      } catch {
        // fallback below
      }

      setSseItems([
        {
          id: "sse-fallback-1",
          title: "Captured handset imagery",
          description: "Recovered communications hardware from objective site.",
          type: "EVIDENCE",
          classification: "CONFIDENTIAL",
          status: "RELEASED",
          imageUrl: "/placeholder.svg",
          collectedDate: "2026-03-16",
        },
      ]);
    };

    loadSse();
  }, [id]);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await fetch(`/api/docs?campaignId=${id}`);
        if (!res.ok) throw new Error("Failed to load docs");
        const data = await res.json();
        setDocs(Array.isArray(data) ? data : []);
      } catch {
        setDocs([]);
      }
    };
    loadDocs();
  }, [id]);

  const personnelByUnit = useMemo(() => {
    const roleByUser = new Map<string, string>();
    const users = new Map<
      string,
      { id: string; name: string; primaryRole: string }
    >();

    (opData?.missions ?? []).forEach((mission) => {
      (mission.rsvps ?? []).forEach((rsvp) => {
        roleByUser.set(rsvp.user_id, "member");
        if (!users.has(rsvp.user_id)) {
          users.set(rsvp.user_id, {
            id: rsvp.user_id,
            name: rsvp.user_name,
            primaryRole: roleByUser.get(rsvp.user_id) || "member",
          });
        }
      });
    });

    return groupPersonnel(Array.from(users.values()), UNIT_GROUP);
  }, [opData?.missions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-lg bg-zinc-200 dark:bg-zinc-900/40" />
        <Skeleton className="h-[400px] w-full rounded-lg bg-zinc-200 dark:bg-zinc-900/40" />
      </div>
    );
  }

  if (!opData) {
    return (
      <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <h2 className="text-xl font-black text-zinc-500 uppercase tracking-widest">
          RECORD NOT FOUND
        </h2>
        <p className="text-sm font-mono text-zinc-600 mt-2">
          The requested operational data is unavailable or restricted.
        </p>
      </div>
    );
  }

  const clr = getClassification(opData.minimum_role);
  const missionCount = opData.missions?.length ?? 0;
  const isAdmin = userRoles.some((role) => role === UserRole.admin);
  const codenameDisplay =
    (opData.codename && opData.codename.trim()) || opData.name || "OPERATION";
  const commanderInitials = (opData.commander || "CO")
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ─── OP HEADER ─── */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/60 rounded-lg p-4 md:p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">
              Operational Command Brief
            </p>
            <div className="flex items-center gap-3">
              {opData.status === "active" && (
                <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-[0_0_15px_rgba(var(--accent),0.8)]"></span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none">
                {codenameDisplay}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3 items-center gap-y-2">
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 ${clr.bg} ${clr.text} ${clr.border}`}
              >
                <Shield className="h-3.5 w-3.5" />
                {clr.label}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                {opData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/60 mt-3 max-w-2xl">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Date Range
                </p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {opData.start_date} - {opData.end_date}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Assigned Unit
                </p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                  <Crosshair className="h-3.5 w-3.5 text-zinc-500" />
                  {opData.mission_type || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Mission Count
          </p>
          <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {missionCount}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            AO
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {opData.ao || "TBD"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Commander
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {opData.commander || "N/A"}
          </p>
        </div>
      </div>

      {/* ─── INFO + MAP ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg h-full min-h-[360px]">
            <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/60 pb-2 p-4">
              <CardTitle className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-accent" />
                Commander&apos;s Intent and Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div>
                <h4 className="text-[10px] font-semibold text-accent/80 uppercase tracking-wider mb-1">
                  Situation Overview
                </h4>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {opData.brief}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/60">
                <div>
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Commanding Officer
                  </h4>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                    {opData.commander}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Force Composition
                  </h4>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                    {opData.force_comp || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/60">
                <div className="flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Mission Type
                    </h4>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      {opData.mission_type || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wifi className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Comms Frequency
                    </h4>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      N/A
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 h-[360px] lg:h-auto">
          <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden h-full flex flex-col min-h-[360px]">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-accent" />
                Command Card
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-200 bg-amber-500/10 shrink-0"
              >
                Map: coming soon
              </Badge>
            </div>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-700 dark:text-zinc-200">
                  {commanderInitials}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Commanding Officer
                  </p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {opData.commander || "Unassigned"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {opData.force_comp || "Task force composition pending"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[200px] flex items-center justify-center bg-zinc-100/80 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800/60">
              <div className="text-center px-6 py-8 space-y-2">
                <MapPin className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Area map
                </p>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Coming soon
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── DOCS / SSE / AAR / PERSONNEL TABS ─── */}
      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg w-full sm:w-auto h-auto grid grid-cols-4 gap-1">
          <TabsTrigger
            value="docs"
            className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400"
          >
            Docs
          </TabsTrigger>
          <TabsTrigger
            value="sse"
            className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400"
          >
            SSE Returns
          </TabsTrigger>
          <TabsTrigger
            value="aar"
            className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400"
          >
            AAR
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400"
          >
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="mt-6 space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Link href={`/dashboard/operations/docs/upload?campaignId=${id}`}>
                <Button className="h-7 text-[10px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/80 text-black">
                  Upload Doc
                </Button>
              </Link>
            </div>
          )}
          {docs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 py-10 text-center text-xs text-zinc-500 uppercase tracking-widest">
              No docs uploaded for this operation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {docs.map((doc) => (
                <Card
                  key={doc.id}
                  className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-500 transition-colors group"
                >
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-zinc-300 dark:border-zinc-600/50 text-zinc-700 dark:text-zinc-300"
                      >
                        {doc.docType || "DOC"}
                      </Badge>
                    </div>
                    <div className="mt-auto space-y-2">
                      <p className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        {doc.classification || "UNCLASSIFIED"}
                      </p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-transparent"
                          onClick={() =>
                            window.open(
                              doc.fileUrl,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          OPEN
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-transparent"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = doc.fileUrl;
                            link.download = doc.title;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1.5" />
                          DOWNLOAD
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sse" className="mt-6 space-y-4">
          <div className="flex justify-end gap-2">
            <Link href={`/dashboard/operations/sse/upload?campaignId=${id}`}>
              <Button className="h-7 text-[10px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/80 text-black">
                Dump SSE
              </Button>
            </Link>
            <Link href="/dashboard/operations/sse">
              <Button
                variant="outline"
                className="h-7 text-[10px] font-bold uppercase tracking-wider border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <Database className="h-3 w-3 mr-1.5" />
                View Full SSE Library
              </Button>
            </Link>
          </div>

          {sseItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 py-10 text-center text-xs text-zinc-500 uppercase tracking-widest">
              No SSE returns released for this operation.
            </div>
          ) : (
            sseItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 md:p-4 flex flex-col md:flex-row gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="relative w-full md:w-[220px] aspect-[16/9] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-950">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="outline">
                      {item.classification || "UNCLASSIFIED"}
                    </Badge>
                    <Badge variant="outline">{item.status}</Badge>
                    <Badge variant="outline">
                      Collected: {item.collectedDate || "-"}
                    </Badge>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent"
                    >
                      DETAILS
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ─── AAR TAB ─── */}
        <TabsContent value="aar" className="mt-6">
          <AarSection campaignId={id} userRoles={["developer"]} />
        </TabsContent>

        {/* ─── PERSONNEL TAB ─── */}
        <TabsContent value="personnel" className="mt-6 space-y-4">
          <Card className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {personnelByUnit.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest border border-dashed rounded-lg">
                  No RSVP personnel yet.
                </div>
              ) : (
                personnelByUnit.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                        {group.label}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {group.users.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {group.users.map((user, index) => (
                        <div
                          key={user.id}
                          className="grid grid-cols-12 gap-3 items-center rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-white dark:bg-zinc-950/40"
                        >
                          <div className="col-span-1 text-[10px] text-zinc-500 font-mono">
                            {index + 1}
                          </div>
                          <div className="col-span-6 text-sm text-zinc-800 dark:text-zinc-200">
                            {user.name}
                          </div>
                          <div className="col-span-3 text-xs text-zinc-500 uppercase">
                            {user.primaryRole || "member"}
                          </div>
                          <div className="col-span-2 text-xs text-zinc-500 uppercase">
                            Member
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

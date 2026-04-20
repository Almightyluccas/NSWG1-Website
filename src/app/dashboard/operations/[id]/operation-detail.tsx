"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WorldMap } from "@/components/operations/world-map";
import {
  MapPin,
  Crosshair,
  Clock,
  Shield,
  FileText,
  Download,
  Terminal,
  Eye,
  Database,
  Users,
  Layers,
  Wifi,
  Target,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import {
  CLASSIFICATIONS,
  getClassification,
  getRedactedName,
} from "@/lib/config/operations";
import { type MockOperation, type MockPersonnel } from "@/types/operations";
import { Skeleton } from "@/components/ui/skeleton";
import { AarSection } from "@/components/operations/aar-section";

// Rough lat/lng for demo (map is marked "coming soon")
const aoCoords: Record<string, { lat: number; lng: number }> = {
  "op-trident-fury": { lat: 35.0, lng: 71.0 },
  "op-silent-storm": { lat: 12.5, lng: 45.0 },
  "op-phantom-eagle": { lat: 39.0, lng: 68.0 },
  "op-iron-shield": { lat: 36.9, lng: -76.0 },
  "op-midnight-sun": { lat: 72.0, lng: 33.0 },
  "op-neptune-reach": { lat: 34.6, lng: -77.3 },
  "op-desert-strike": { lat: 33.4, lng: 43.3 },
  "op-crimson-tide": { lat: 32.7, lng: -117.2 },
  "op-viper-strike": { lat: 31.5, lng: 64.0 },
  "op-shadow-lance": { lat: 20.0, lng: 130.0 },
};

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

export function OperationDetailClient({ id }: { id: string }) {
  const [opData, setOpData] = useState<MockOperation | null>(null);
  const [sseItems, setSseItems] = useState<ScopedSseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock clearance toggle for demo
  const [viewerClearance, setViewerClearance] = useState("developer");
  const [devMode, setDevMode] = useState(false);

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
        const res = await fetch(`/api/sse?scope=management&campaignId=${id}`);
        if (!res.ok) throw new Error("Failed to load SSE.");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSseItems(data);
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
          status: "ANALYZING",
          imageUrl: "/placeholder.svg",
          collectedDate: "2026-03-16",
        },
      ]);
    };

    loadSse();
  }, [id]);

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
        <h2 className="text-xl font-black text-zinc-500 uppercase tracking-widest">RECORD NOT FOUND</h2>
        <p className="text-sm font-mono text-zinc-600 mt-2">The requested operational data is unavailable or restricted.</p>
      </div>
    );
  }

  const clr = getClassification(opData.minimum_role);
  const coords = aoCoords[id] ?? { lat: 0, lng: 0 };
  const missionCount = opData.missions?.length ?? 0;
  const commanderInitials = (opData.commander || "CO")
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const opDocs = [
    {
      type: "COMMANDER INTENT",
      desc: "Leadership guidance and execution priorities",
      name: `${opData.codename.replace(/\s+/g, "_")}_intent.pdf`,
      fileType: "PDF",
      href: "/documents/nswg1-sop-001.pdf",
    },
    {
      type: "REMARKS",
      desc: "Command notes and mission caveats",
      name: `${opData.codename.replace(/\s+/g, "_")}_remarks.docx`,
      fileType: "DOCX",
      href: "/documents/nswg1-opsec-026.docx",
    },
    {
      type: "ANNEX",
      desc: "Supporting references and operational notes",
      name: `${opData.codename.replace(/\s+/g, "_")}_annex.pdf`,
      fileType: "PDF",
      href: "/documents/st2-aar-041.pdf",
    },
  ];

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
              {opData.status === 'active' && (
                <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-[0_0_15px_rgba(var(--accent),0.8)]"></span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none">
                {opData.codename}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3 items-center gap-y-2">
              <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 ${clr.bg} ${clr.text} ${clr.border}`}>
                <Shield className="h-3.5 w-3.5" />
                {clr.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
                {opData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/60 mt-3 max-w-2xl">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Date Range</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {opData.start_date} - {opData.end_date}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Assigned Unit</p>
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Mission Count</p>
          <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{missionCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">AO</p>
          <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{opData.ao || "TBD"}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Commander</p>
          <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{opData.commander || "N/A"}</p>
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
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">N/A</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 h-[360px] lg:h-auto">
          <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden h-full flex flex-col min-h-[360px]">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-accent" />
                Command Card
              </span>
            </div>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-700 dark:text-zinc-200">
                  {commanderInitials}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Commanding Officer</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{opData.commander || "Unassigned"}</p>
                  <p className="text-xs text-zinc-500">{opData.force_comp || "Task force composition pending"}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="opacity-45 blur-[0.2px]">
                <WorldMap lat={coords.lat} lng={coords.lng} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── INTEL / PLANNING / SSE / PERSONNEL TABS ─── */}
      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg w-full sm:w-auto h-auto grid grid-cols-5 gap-1">
          <TabsTrigger value="docs" className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Docs
          </TabsTrigger>
          <TabsTrigger value="planning" className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Planning Docs
          </TabsTrigger>
          <TabsTrigger value="sse" className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            SSE Returns
          </TabsTrigger>
          <TabsTrigger value="aar" className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            AAR
          </TabsTrigger>
          <TabsTrigger value="personnel" className="text-[10px] md:text-xs font-semibold uppercase tracking-wider py-1.5 md:py-2 rounded-lg data-[state=active]:bg-zinc-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {opDocs.map((doc, i) => (
              <Card key={i} className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-500 transition-colors group">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-zinc-300 dark:border-zinc-600/50 text-zinc-700 dark:text-zinc-300">
                      {doc.fileType}
                    </Badge>
                  </div>
                  <div className="mt-auto space-y-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider">{doc.type}</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{doc.name}</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">{doc.desc}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-transparent"
                        onClick={() => window.open(doc.href, "_blank", "noopener,noreferrer")}
                      >
                        OPEN
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-transparent"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.href;
                          link.download = doc.name;
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
        </TabsContent>

        <TabsContent value="planning" className="mt-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { type: "CONOP", desc: "Concept of Operations", name: "CONOP_V2.pdf", fileType: "PDF" },
                { type: "WARNO", desc: "Warning Order", name: "WARNO_01.docx", fileType: "DOCX" },
                { type: "FRAGO", desc: "Fragmentary Order", name: "FRAGO_UPDATE_04.pdf", fileType: "PDF" },
              ].map((doc, i) => (
                <Card key={i} className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-500 transition-colors group">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-zinc-300 dark:border-zinc-600/50 text-zinc-700 dark:text-zinc-300">
                        {doc.fileType}
                      </Badge>
                    </div>
                    <div className="mt-auto">
                       <p className="text-[10px] font-bold text-accent uppercase tracking-wider">{doc.type}</p>
                       <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 mb-1 truncate">{doc.name}</p>
                       <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 truncate">{doc.desc}</p>
                       <Button variant="outline" size="sm" className="w-full h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                         <Download className="h-3 w-3 mr-1.5" />
                         DOWNLOAD
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="sse" className="mt-6 space-y-4">
           {sseItems.map(item => (
              <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 md:p-4 flex flex-col md:flex-row gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                <div className="relative w-full md:w-[220px] aspect-[16/9] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-950">
                  <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="outline">{item.classification || "UNCLASSIFIED"}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                    <Badge variant="outline">Collected: {item.collectedDate || "-"}</Badge>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                      DETAILS
                    </Button>
                  </div>
                </div>
              </div>
           ))}

           <div className="pt-4 flex justify-end">
              <Link href="/dashboard/operations/sse">
                 <Button className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-bold uppercase tracking-wider h-9">
                   <Database className="h-4 w-4 mr-2" />
                   VIEW FULL SSE LIBRARY
                 </Button>
              </Link>
           </div>
        </TabsContent>

        {/* ─── AAR TAB ─── */}
        <TabsContent value="aar" className="mt-6">
          <AarSection
            campaignId={id}
            userRoles={[viewerClearance]}
          />
        </TabsContent>

        {/* ─── PERSONNEL TAB ─── */}
        <TabsContent value="personnel" className="mt-6 space-y-4">
          {/* Clearance Viewer Toggle */}
          <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Task Force Personnel</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Names redacted according to logged-in user role rules.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button 
                  onClick={() => setDevMode(!devMode)}
                  variant="outline" 
                  size="sm" 
                  className={`h-8 text-xs font-bold uppercase tracking-wider border-zinc-200 dark:border-zinc-700 ${devMode ? 'bg-accent/10 text-accent border-accent/40' : 'text-zinc-700 dark:text-zinc-300 bg-transparent'}`}
                >
                  <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Dev Mode Override
                </Button>

                {devMode && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800/80 pl-4">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Test Role:</span>
                    <select
                      value={viewerClearance}
                      onChange={(e) => setViewerClearance(e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-bold rounded-lg px-3 py-1 focus:border-accent/50 focus:outline-none"
                    >
                      {CLASSIFICATIONS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personnel Table */}
          <Card className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Role / Billet</div>
              <div className="col-span-2">Min. Clearance</div>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              <div className="px-5 py-6 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                Personnel Roster API Integration Required
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

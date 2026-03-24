"use client";

import { useState } from "react";
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
  Radio,
  Eye,
  Camera,
  Database,
  Lock,
  Users,
  Layers,
  Wifi,
  Target,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_OPERATIONS,
  CLASSIFICATIONS,
  getClassification,
  getRedactedName,
  type MockOperation,
} from "@/lib/config/operations";

// Rough lat/lng for demo
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

const sseItems = [
  { id: "sse-001", type: "DOCUMENT", name: "Hostile Route Maps", date: "2026-03-16", status: "ANALYZING" },
  { id: "sse-002", type: "MEDIA", name: "Encrypted Hard Drive", date: "2026-03-16", status: "LOCKED" },
  { id: "sse-003", type: "EVIDENCE", name: "Weapon Hardware Fragments", date: "2026-03-15", status: "LOGGED" },
];

export function OperationDetailClient({ id }: { id: string }) {
  const opData = MOCK_OPERATIONS.find((op) => op.id === id) ?? MOCK_OPERATIONS[0];
  const clr = getClassification(opData.classification);
  const coords = aoCoords[id] ?? { lat: 0, lng: 0 };

  // Mock clearance toggle for demo
  const [viewerClearance, setViewerClearance] = useState("TOP_SECRET");

  return (
    <div className="space-y-6">
      {/* ─── OP HEADER ─── */}
      <div className="bg-zinc-900/80 border border-zinc-700/60 rounded-sm p-5 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              {opData.status === 'ACTIVE' && (
                <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-[0_0_15px_rgba(var(--accent),0.8)]"></span>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest leading-none">
                {opData.codename}
              </h1>
            </div>

            <div className="flex flex-wrap gap-4 items-center gap-y-2">
              <Badge variant="outline" className={`text-xs uppercase font-bold tracking-wider px-3 py-1 flex items-center gap-2 ${clr.bg} ${clr.text} ${clr.border}`}>
                <Shield className="h-4 w-4" />
                {clr.label}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider px-3 py-1 border-zinc-700 text-zinc-200">
                {opData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60 mt-4 max-w-2xl">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Date Range</p>
                <p className="text-base text-zinc-200 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {opData.dates}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Assigned Unit</p>
                <p className="text-base text-zinc-200 font-medium flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-zinc-500" />
                  {opData.unit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── INFO & MAP SPLIT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Info Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm h-full">
            <CardHeader className="border-b border-zinc-800/60 pb-3 p-5">
              <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" />
                Mission Brief &amp; Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-accent/80 uppercase tracking-wider mb-2">Situation Overview</h4>
                <p className="text-base text-zinc-200 leading-relaxed">
                  {opData.brief}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800/60">
                 <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Commanding Officer</h4>
                    <p className="text-base text-zinc-200 font-medium">{opData.commander}</p>
                 </div>
                 <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Force Composition</h4>
                    <p className="text-base text-zinc-200 font-medium">{opData.forceComp}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800/60">
                 <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Mission Type</h4>
                      <p className="text-sm text-zinc-200 font-medium">{opData.missionType}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <Wifi className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Comms Frequency</h4>
                      <p className="text-sm text-zinc-200 font-medium">{opData.commsFreq}</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-5 h-[300px] lg:h-auto">
          <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm overflow-hidden h-full flex flex-col">
            <div className="bg-zinc-950 p-3 border-b border-zinc-800/80 flex justify-between items-center">
               <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                 <MapPin className="h-3.5 w-3.5 text-accent" />
                 Area of Operations
               </span>
               <span className="text-xs font-bold text-accent">{opData.ao}</span>
            </div>
            <div className="flex-1 w-full relative">
               <WorldMap lat={coords.lat} lng={coords.lng} />
            </div>
          </Card>
        </div>
      </div>

      {/* ─── INTEL / PLANNING / SSE / PERSONNEL TABS ─── */}
      <Tabs defaultValue="intel" className="w-full">
        <TabsList className="bg-zinc-900/80 border border-zinc-800 p-1 rounded-sm w-full sm:w-auto h-auto grid grid-cols-4 gap-1">
          <TabsTrigger value="intel" className="text-sm font-semibold uppercase tracking-wider py-2.5 rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="planning" className="text-sm font-semibold uppercase tracking-wider py-2.5 rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Planning Docs
          </TabsTrigger>
          <TabsTrigger value="sse" className="text-sm font-semibold uppercase tracking-wider py-2.5 rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            SSE Returns
          </TabsTrigger>
          <TabsTrigger value="personnel" className="text-sm font-semibold uppercase tracking-wider py-2.5 rounded-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400">
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intel" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-zinc-900/40 border-zinc-800/80 rounded-sm">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400" /> Regional Intel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-base text-zinc-200 leading-relaxed">
                  Mountainous terrain with severe elevation changes. Local populace moderately hostile with deep tribal affiliations. Limited road infrastructure; reliance on rotary-wing assets highly advised.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/80 rounded-sm">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="h-4 w-4 text-zinc-400" /> Operational Intel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-base text-zinc-200 leading-relaxed">
                  Enemy force estimated at 40-50 combatants equipped with small arms, RPGs, and heavy machine guns. Compound is heavily fortified with overlapping fields of fire. HVT expected to be present within central structure.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/80 rounded-sm md:col-span-2">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="h-4 w-4 text-zinc-400" /> Signal Intelligence (SIGINT)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-sm p-3 font-mono text-sm text-accent/80 space-y-1">
                   <p>[TIME:0400Z] INTERCEPT: RADIO TRAFFIC INCREASE DETECTED ON FREQ 145.500MHz.</p>
                   <p>[TIME:0415Z] SOURCE IDENTIFIED: COMPOUND NORTH GUARD TOWER.</p>
                   <p>[TIME:1030Z] SATELLITE IMAGERY CONFIRMS 3 VEHICLES ARRIVING; MATCHES HVT PROFILE.</p>
                   <p className="text-zinc-500 mt-2">{"// ENCRYPTION LEVEL: LOW // CONFIDENCE: HIGH //"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: "CONOP", desc: "Concept of Operations", name: "CONOP_V2.pdf", fileType: "PDF" },
                { type: "WARNO", desc: "Warning Order", name: "WARNO_01.docx", fileType: "DOCX" },
                { type: "FRAGO", desc: "Fragmentary Order", name: "FRAGO_UPDATE_04.pdf", fileType: "PDF" },
              ].map((doc, i) => (
                <Card key={i} className="bg-zinc-900/60 border-zinc-700/50 rounded-sm hover:border-zinc-500 transition-colors group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-sm bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs font-bold border-zinc-600/50 text-zinc-300">
                        {doc.fileType}
                      </Badge>
                    </div>
                    <div className="mt-auto">
                       <p className="text-xs font-bold text-accent uppercase tracking-wider">{doc.type}</p>
                       <p className="text-base font-semibold text-zinc-200 mt-1 mb-1 truncate">{doc.name}</p>
                       <p className="text-sm text-zinc-300 mb-4 truncate">{doc.desc}</p>
                       <Button variant="outline" size="sm" className="w-full h-8 text-sm border-zinc-700 text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                         <Download className="h-3.5 w-3.5 mr-2" />
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
              <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                      {item.type === 'MEDIA' ? <Terminal className="h-4 w-4 text-cyan-400" /> : 
                       item.type === 'DOCUMENT' ? <FileText className="h-4 w-4 text-emerald-400" /> : 
                       <Camera className="h-4 w-4 text-amber-400" />}
                   </div>
                   <div>
                      <h4 className="text-sm font-semibold text-zinc-200">{item.name}</h4>
                      <p className="text-sm font-medium text-zinc-300 mt-0.5">COLLECTED: {item.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`text-xs font-bold uppercase tracking-wider ${
                     item.status === 'LOCKED' ? 'text-red-400' : 
                     item.status === 'ANALYZING' ? 'text-amber-400' : 'text-zinc-300'
                   }`}>
                     {item.status}
                   </span>
                   <Button size="sm" variant="outline" className="h-7 text-xs border-zinc-700 text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                     DETAILS
                   </Button>
                </div>
              </div>
           ))}

           <div className="pt-4 flex justify-end">
              <Link href="/operations/sse">
                 <Button className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold uppercase tracking-wider h-9">
                   <Database className="h-4 w-4 mr-2" />
                   VIEW FULL SSE LIBRARY
                 </Button>
              </Link>
           </div>
        </TabsContent>

        {/* ─── PERSONNEL TAB ─── */}
        <TabsContent value="personnel" className="mt-6 space-y-4">
          {/* Clearance Viewer Toggle */}
          <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Task Force Personnel</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Names redacted based on your clearance level</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">View As:</span>
                <select
                  value={viewerClearance}
                  onChange={(e) => setViewerClearance(e.target.value)}
                  className="bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm font-bold rounded-sm px-3 py-1.5 focus:border-accent/50 focus:outline-none"
                >
                  {CLASSIFICATIONS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Table */}
          <Card className="bg-zinc-900/40 border-zinc-800/80 rounded-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Role / Billet</div>
              <div className="col-span-2">Min. Clearance</div>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {opData.personnel.map((person, idx) => {
                const displayName = getRedactedName(person, viewerClearance);
                const isRedacted = displayName === "██████████";
                const minClr = getClassification(person.minClearance);
                return (
                  <div key={idx} className="md:grid md:grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-zinc-800/20 transition-colors">
                    <div className="col-span-1 text-sm text-zinc-500 font-bold">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="col-span-5">
                      <p className={`text-sm font-bold ${isRedacted ? 'text-red-400/60 font-mono tracking-widest select-none' : 'text-zinc-200'}`}>
                        {displayName}
                      </p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm text-zinc-300">{person.role}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${minClr.bg} ${minClr.text} ${minClr.border}`}>
                        {minClr.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  FileText,
  Terminal,
  Camera,
  Download,
  ShieldAlert,
  Save,
  BellRing,
  CheckCircle2,
  Target,
  Zap,
  Fingerprint,
  Box,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_SSE,
  CLASSIFICATIONS,
  SSE_STATUSES,
  SSE_CATEGORIES,
  getClassification,
  getSseStatus,
} from "@/lib/config/operations";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-5 w-5" />,
  Terminal: <Terminal className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Fingerprint: <Fingerprint className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Camera: <Camera className="h-5 w-5" />,
};

function getCategoryIcon(typeKey: string) {
  const cat = SSE_CATEGORIES.find((c) => c.key === typeKey);
  if (!cat) return <Box className="h-5 w-5 text-zinc-400" />;
  const icon = iconMap[cat.iconName];
  return <span className={cat.iconColor}>{icon ?? <Box className="h-5 w-5" />}</span>;
}

export function SseDetailClient({ id }: { id: string }) {
  const record = MOCK_SSE.find((s) => s.id === id) ?? MOCK_SSE[0];

  const [status, setStatus] = useState(record.status);
  const [classification, setClassification] = useState(record.classification);
  const [showNotification, setShowNotification] = useState(false);

  const clr = getClassification(classification);
  const statusCfg = getSseStatus(status);

  const handleUpdate = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <Link 
          href="/operations/sse"
          className="inline-flex items-center text-sm font-semibold text-zinc-300 hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          BACK TO SSE LIBRARY
        </Link>
      </div>

      {showNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-sm p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Update Successful</p>
            <p className="text-sm text-emerald-300/80">Classification and status applied. Automated notification dispatched to uploader ({record.uploader}).</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Review */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm h-full">
            <CardHeader className="border-b border-zinc-800/60 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-sm bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
                    {getCategoryIcon(record.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">{record.name}</h2>
                    <p className="text-sm font-semibold text-accent">{record.op}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${clr.border} ${clr.text} ${clr.bg}`}>
                  {clr.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</p>
                  <p className={`text-sm font-bold uppercase tracking-wide ${statusCfg.text}`}>{status}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date Logged</p>
                  <p className="text-sm text-zinc-200 font-medium">{record.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Uploader</p>
                  <p className="text-sm text-zinc-200 font-medium">{record.uploader}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm text-zinc-200 font-medium">{record.type}</p>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-6">
                 <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Item Description / Initial Findings</h3>
                 <p className="text-base text-zinc-200 leading-relaxed bg-zinc-950/50 p-4 rounded-sm border border-zinc-800/40">
                   {record.description}
                 </p>
              </div>

              <div className="border-t border-zinc-800/60 pt-6">
                 <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Attached Files</h3>
                 <div className="flex items-center justify-between p-3 rounded-sm border border-zinc-700/50 bg-zinc-800/20">
                    <div className="flex items-center gap-3">
                       <FileText className="h-5 w-5 text-zinc-400" />
                       <div>
                          <p className="text-sm font-semibold text-zinc-200">{record.name.toLowerCase().replace(/\s+/g, '_')}_scan.pdf</p>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider">4.2 MB • PDF</p>
                       </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                      <Download className="h-4 w-4" />
                    </Button>
                 </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reviewer Tools */}
        <div className="col-span-1 space-y-6">
          <Card className="bg-zinc-900/80 border-accent/30 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent/50"></div>
            <CardHeader className="border-b border-zinc-800/60 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-accent" />
                Reviewer Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              
              <div className="space-y-4">
                 <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                   You are viewing this record with Intelligence Officer privileges. You can alter its classification and analysis status based on review findings.
                 </p>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Classification Level</label>
                    <select 
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm font-bold rounded-sm px-3 py-2 h-10 focus:border-accent/50 focus:outline-none"
                    >
                      {CLASSIFICATIONS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Analysis Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm font-bold rounded-sm px-3 py-2 h-10 focus:border-accent/50 focus:outline-none"
                    >
                      {SSE_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60">
                 <Button onClick={handleUpdate} className="w-full bg-accent hover:bg-accent/80 text-black font-bold uppercase tracking-wider">
                   <Save className="h-4 w-4 mr-2" />
                   Commit Changes
                 </Button>
                 <p className="text-[10px] text-zinc-400 text-center mt-3 uppercase tracking-widest flex justify-center items-center gap-1.5">
                    <BellRing className="h-3 w-3" />
                    Uploader will be notified
                 </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

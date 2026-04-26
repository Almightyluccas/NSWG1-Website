"use client";

import { useState, useEffect } from "react";
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
  Settings2,
} from "lucide-react";
import Link from "next/link";
import {
  CLASSIFICATIONS,
  SSE_STATUSES,
  SSE_CATEGORIES,
  getClassification,
  getSseStatus,
} from "@/lib/config/operations";
import { type MockSseItem } from "@/types/sse";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <span className={cat.iconColor}>{icon ?? <Box className="h-5 w-5" />}</span>
  );
}

export function SseDetailClient({ id }: { id: string }) {
  const [record, setRecord] = useState<MockSseItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [classification, setClassification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [allItems, setAllItems] = useState<MockSseItem[]>([]);
  const [showUploaderItems, setShowUploaderItems] = useState(false);

  useEffect(() => {
    async function fetchSseDetail() {
      try {
        const res = await fetch("/api/sse");
        const data: MockSseItem[] = await res.json();
        if (Array.isArray(data)) {
          setAllItems(data);
          const numericId = parseInt(id.replace("sse-", ""), 10);
          const found = data.find((s) => s.id === numericId) ?? data[0] ?? null;
          if (found) {
            setRecord(found);
            setStatus(found.status);
            setClassification(found.minimum_role);
          } else {
            setRecord(null);
          }
        } else {
          setRecord(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSseDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-[200px] w-full rounded-lg bg-zinc-200 dark:bg-zinc-900/60" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg mt-6">
        <h2 className="text-xl font-black text-zinc-500 uppercase tracking-widest">
          RECORD NOT FOUND
        </h2>
        <p className="text-sm font-mono text-zinc-600 mt-2">
          The requested payload could not be located in the registry.
        </p>
      </div>
    );
  }

  const clr = getClassification(classification);
  const statusCfg = getSseStatus(status);

  const handleUpdate = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };
  const uploaderItems = record
    ? allItems.filter((item) => item.uploaded_by === record.uploaded_by)
    : [];

  return (
    <div className="space-y-4 max-w-6xl relative z-10">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/dashboard/operations/sse"
          className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          BACK TO SSE REGISTRY
        </Link>
      </div>

      {showNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] rounded-lg p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              NETWORK AUTHENTICATION: SUCCESS
            </p>
            <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-300/80 mt-1">
              Classification and status applied. Automated notification
              dispatched to source terminal // {record.uploaded_by}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Data Review */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg relative overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/60 p-5 relative z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-inner flex items-center justify-center">
                    {getCategoryIcon(record.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest drop-shadow-sm">
                      {record.name}
                    </h2>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <Target className="h-3 w-3" />
                      OP-{record.campaign_id}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border shadow-sm ${clr.border} ${clr.text} ${clr.bg}`}
                  >
                    {clr.label}
                  </Badge>
                  <p className="text-[9px] font-mono font-medium text-zinc-500 tracking-widest">
                    SYS.ID: {record.id}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900/40 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800/60">
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3" /> Status
                  </p>
                  <p
                    className={`text-xs font-black uppercase tracking-widest ${statusCfg.text}`}
                  >
                    {status}
                  </p>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Fingerprint className="h-3 w-3" /> Source Node
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowUploaderItems(true)}
                    className="text-xs text-zinc-800 dark:text-zinc-200 font-bold tracking-wider hover:text-accent transition-colors"
                  >
                    {record.uploader_name || record.uploaded_by}
                  </button>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Box className="h-3 w-3" /> Trace Category
                  </p>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-bold tracking-wider">
                    {record.type}
                  </p>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="h-3 w-3" /> Timestamp
                  </p>
                  <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 tracking-wider font-semibold">
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="p-5 md:p-6 pb-2">
                {record.image_url && (
                  <div className="mb-5 w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800/60 shadow-inner group relative">
                    <div className="absolute inset-0 bg-transparent group-hover:bg-accent/10 transition-colors pointer-events-none z-10" />
                    <img
                      src={record.image_url}
                      alt={record.name || "SSE Visual"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 text-[9px] font-mono px-2 py-0.5 border border-zinc-200 dark:border-zinc-700/80 rounded-lg z-20">
                      VISUAL.LINK // VALID
                    </div>
                  </div>
                )}

                <h3 className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" /> Payload Analysis Summary
                </h3>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 rounded-lg shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100 dark:bg-zinc-800 transition-colors group-hover:bg-accent/40" />
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed relative pl-2">
                    {record.description}
                  </p>
                </div>
              </div>

              <div className="p-5 md:p-6 pt-3">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
                  Extracted Cipher Artifacts
                </h3>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-900/40 group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg group-hover:border-accent/40 shadow-inner">
                      <FileText className="h-4 w-4 text-zinc-500 group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-wider">
                        PAYLOAD_EXTRACT_{String(record.id).padStart(3, "0")}.dat
                      </p>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                        4.2 MB • ENCRYPTED_ARCHIVE
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-accent hover:text-black hover:border-accent transition-all shadow-sm rounded-lg"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Right Column: Reviewer Tools */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-accent/20 via-accent border-b border-accent/40" />

            <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 relative z-10">
              <CardTitle className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-accent" />
                OVERSEER COM-LINK
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 relative z-10">
              <div className="space-y-6 flex flex-col h-full">
                <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg flex items-start gap-3 shadow-inner">
                  <ShieldAlert className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono uppercase tracking-widest">
                    Authorization Confirmed:{" "}
                    <span className="text-accent font-black">
                      Intelligence Officer
                    </span>
                    . Access modification permits granted for target payload.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Target Classification Filter
                    </label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-wider rounded-lg px-3 py-2.5 h-11 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {CLASSIFICATIONS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Operational Sequence State
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-wider rounded-lg px-3 py-2.5 h-11 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {SSE_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 mt-auto">
                  <Button
                    onClick={handleUpdate}
                    className="w-full bg-accent hover:bg-accent/90 text-black font-black uppercase tracking-widest rounded-lg h-11 hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] transition-all flex pt-1"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    COMMIT CHANGES
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={showUploaderItems} onOpenChange={setShowUploaderItems}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-sm uppercase tracking-wider">
              SSE uploads by {record.uploader_name || record.uploaded_by}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {uploaderItems.map((item) => (
              <div
                key={`detail-uploader-${item.id}`}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950/50 space-y-2"
              >
                <div className="h-32 w-full rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name || "SSE"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  {item.name}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

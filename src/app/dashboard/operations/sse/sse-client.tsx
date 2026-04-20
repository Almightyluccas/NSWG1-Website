"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UploadCloud,
  Filter,
  FileText,
  Terminal,
  Database,
  ExternalLink,
  ChevronLeft,
  ArrowUpDown,
  Fingerprint,
  Zap,
  Target,
  Box,
  Camera,
} from "lucide-react";
import Link from "next/link";
import {
  SSE_CATEGORIES,
  getClassification,
  getSseStatus,
} from "@/lib/config/operations";
import { type MockSseItem } from "@/types/sse";
import { UserRole } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  Terminal: <Terminal className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Fingerprint: <Fingerprint className="h-4 w-4" />,
  Box: <Box className="h-4 w-4" />,
  Camera: <Camera className="h-4 w-4" />,
};

function getCategoryIcon(typeKey: string) {
  const cat = SSE_CATEGORIES.find((c) => c.key === typeKey);
  if (!cat) return <Box className="h-4 w-4 text-zinc-400" />;
  const icon = iconMap[cat.iconName];
  return <span className={cat.iconColor}>{icon ?? <Box className="h-4 w-4" />}</span>;
}

export function SseLibraryClient({ userRoles = [] }: { userRoles?: string[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState<"DATE_DESC" | "DATE_ASC" | "OP_ASC" | "OP_DESC">("DATE_DESC");
  const [items, setItems] = useState<MockSseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUploader, setSelectedUploader] = useState<string | null>(null);

  const canReview = userRoles.some((r) =>
    [UserRole.admin, UserRole.superAdmin, UserRole.developer, UserRole.intelligence].includes(r),
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Dense list fits on one screen without scrolling

  useEffect(() => {
    async function fetchSse() {
      try {
        const res = await fetch("/api/sse");
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch SSE", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSse();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(item.campaign_id).includes(searchTerm);
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "DATE_DESC") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "DATE_ASC") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "OP_ASC") return String(a.campaign_id).localeCompare(String(b.campaign_id));
    if (sortBy === "OP_DESC") return String(b.campaign_id).localeCompare(String(a.campaign_id));
    return 0;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const uploaderItems = selectedUploader
    ? items.filter((item) => item.uploaded_by === selectedUploader)
    : [];

  if (loading) {
     return (
        <div className="space-y-4">
           <Skeleton className="h-[120px] w-full rounded-lg bg-zinc-200 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50" />
           <Skeleton className="h-[400px] w-full rounded-lg bg-zinc-200 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50" />
        </div>
     );
  }

  return (
    <div className="space-y-4">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
           <Link 
             href="/dashboard/operations"
             className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-accent transition-colors uppercase tracking-widest mb-2"
           >
             <ChevronLeft className="h-3 w-3 mr-1" />
             Return to Operations Command
           </Link>
           <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-widest drop-shadow-md">
             Global SSE Registry
           </h1>
        </div>
        <Link href="/dashboard/operations/sse/upload">
          <Button className="bg-accent/10 hover:bg-accent border border-accent/40 hover:border-accent text-accent hover:text-black transition-all text-xs font-black uppercase tracking-widest h-9 px-4 rounded-lg">
            <UploadCloud className="h-3.5 w-3.5 mr-2" />
            Upload Evidence
          </Button>
        </Link>
      </div>

      {/* ─── FILTERS COMMAND DECK ─── */}
      <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 relative group p-3">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/60" />
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/70" />
            <Input
              placeholder="Query payload identifiers or operation codenames..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-emerald-50 placeholder:text-zinc-500 text-xs focus:border-accent/80 font-mono transition-all h-9 rounded-lg"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 rounded-lg">
              <Filter className="h-3 w-3 text-zinc-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer min-w-[120px] focus:outline-none appearance-none"
              >
                <option value="ALL">ALL CATEGORIES</option>
                {SSE_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 rounded-lg">
              <ArrowUpDown className="h-3 w-3 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer min-w-[120px] focus:outline-none appearance-none"
              >
                <option value="DATE_DESC">NEWEST ACQUISITIONS</option>
                <option value="DATE_ASC">OLDEST ACQUISITIONS</option>
                <option value="OP_ASC">OPERATION (A-Z)</option>
                <option value="OP_DESC">OPERATION (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SSE LISTING MATRIX ─── */}
      <div className="space-y-2 relative z-10">
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
           <div className="col-span-4">Payload Trace</div>
           <div className="col-span-2">Source Action</div>
           <div className="col-span-2">Clearance Restrictor</div>
           <div className="col-span-2">Network Status</div>
           <div className="col-span-2 text-right">Terminals</div>
        </div>

        {paginatedItems.length === 0 ? (
           <div className="py-12 text-center bg-white dark:bg-zinc-900/40 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Database className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">NO REGISTRIES MATCH QUERY PARAMETERS</p>
           </div>
        ) : (
           <div className="space-y-2">
             {paginatedItems.map(item => {
               const clr = getClassification(item.minimum_role);
               const statusCfg = getSseStatus(item.status);
               return (
                <div key={item.id} className="group relative md:grid md:grid-cols-12 gap-3 px-5 py-3 items-center bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all rounded-lg">
                  {/* Glowing Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-70 group-hover:opacity-100 transition-opacity ${clr.strip}`} />
                  
                  {/* Trace Block - Img Thumbnail replacing icon */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-10 w-14 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shrink-0 overflow-hidden shadow-sm group-hover:border-accent/40 transition-colors">
                        {item.image_url ? (
                           <img src={item.image_url} alt={item.name || "SSE Item"} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             {getCategoryIcon(item.type)}
                           </div>
                        )}
                    </div>
                    <div className="min-w-0">
                       <h4 className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 truncate tracking-wide">{item.name || "UNNAMED ASSET"}</h4>
                       <p className="text-[9px] font-mono font-medium text-accent/80 mt-0.5 uppercase tracking-widest">
                          <span className="text-zinc-500 mr-1">ID:</span>SYS-X{String(item.id).padStart(4, '0')}
                       </p>
                       <button
                         type="button"
                         onClick={() => setSelectedUploader(item.uploaded_by)}
                         className="text-[9px] mt-1 font-mono uppercase tracking-widest text-zinc-500 hover:text-accent transition-colors"
                       >
                        Uploader: {item.uploader_name || item.uploaded_by}
                       </button>
                    </div>
                  </div>

                  {/* Operation */}
                  <div className="col-span-2 mt-3 md:mt-0">
                     <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate uppercase tracking-wider">{item.campaign_name || `OP-${item.campaign_id}`}</p>
                  </div>

                  {/* Classification */}
                  <div className="col-span-2 mt-2 md:mt-0">
                     <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-widest px-2 py-0 rounded-lg ${clr.border} ${clr.text} ${clr.bg}`}>
                        {clr.label}
                     </Badge>
                  </div>

                  {/* Status & Date */}
                  <div className="col-span-2 flex flex-col items-start justify-center mt-2 md:mt-0">
                     <div className="flex items-center gap-1.5 mb-0.5">
                        {item.status === 'ANALYZING' && <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${statusCfg.text}`}>
                          {item.status}
                        </span>
                     </div>
                     <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
                       {new Date(item.created_at).toLocaleDateString()}
                     </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex md:justify-end gap-1.5 mt-3 md:mt-0">
                     {canReview && (item.status === 'LOGGED' || item.status === 'ANALYZING') && (
                       <>
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-7 px-2 rounded-md text-[9px] font-bold uppercase tracking-wider border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                           onClick={async (e) => {
                             e.stopPropagation();
                             await fetch(`/api/sse/${item.id}`, {
                               method: "PUT",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ status: "RELEASED" }),
                             });
                             setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "RELEASED" as any } : i));
                           }}
                         >
                           Approve
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-7 px-2 rounded-md text-[9px] font-bold uppercase tracking-wider border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-500/10 bg-transparent"
                           onClick={async (e) => {
                             e.stopPropagation();
                             await fetch(`/api/sse/${item.id}`, {
                               method: "PUT",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ status: "LOCKED" }),
                             });
                             setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "LOCKED" as any } : i));
                           }}
                         >
                           Reject
                         </Button>
                       </>
                     )}
                     <Link href={`/dashboard/operations/sse/${item.id}`} className="flex-1 md:flex-none">
                        <Button size="sm" variant="outline" className="w-full h-7 rounded-md text-[9px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-accent hover:text-black hover:border-accent transition-all bg-white dark:bg-zinc-900 group-hover:border-zinc-300 dark:group-hover:border-zinc-500">
                           <ExternalLink className="h-3 w-3 mr-1" /> VIEW
                        </Button>
                     </Link>
                  </div>
                </div>
               );
             })}
           </div>
        )}

        {/* ─── PAGINATION BOTTOM BAR ─── */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 pt-4 mt-4">
                <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} records
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[10px] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        PREV
                    </Button>
                    <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-bold px-2">PG {currentPage} / {totalPages}</p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[10px] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        NEXT
                    </Button>
                </div>
            </div>
        )}
      </div>

      <Dialog open={!!selectedUploader} onOpenChange={(open) => !open && setSelectedUploader(null)}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-sm uppercase tracking-wider">
              Uploads by {selectedUploader}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {uploaderItems.map((item) => (
              <div
                key={`uploader-${item.id}`}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950/50 space-y-2"
              >
                <div className="h-32 w-full rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name || "SSE item"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  {item.name}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

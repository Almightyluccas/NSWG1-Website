"use client";

import { useState } from "react";
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
  MOCK_SSE,
  SSE_CATEGORIES,
  getClassification,
  getSseStatus,
} from "@/lib/config/operations";

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

export function SseLibraryClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState<"DATE_DESC" | "DATE_ASC" | "OP_ASC" | "OP_DESC">("DATE_DESC");

  const filteredItems = MOCK_SSE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.op.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "DATE_DESC") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "DATE_ASC") return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === "OP_ASC") return a.op.localeCompare(b.op);
    if (sortBy === "OP_DESC") return b.op.localeCompare(a.op);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-4">
        <Link 
          href="/operations"
          className="inline-flex items-center text-sm font-semibold text-zinc-300 hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          BACK TO OPERATIONS CENTER
        </Link>
        <Link href="/operations/sse/upload">
          <Button className="bg-accent hover:bg-accent/80 text-black text-sm font-bold uppercase tracking-wider h-9">
            <UploadCloud className="h-4 w-4 mr-2" />
            UPLOAD SSE
          </Button>
        </Link>
      </div>

      {/* ─── FILTERS ─── */}
      <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search SSE records by name or operation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/60 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 text-sm focus:border-accent/50 h-9"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-zinc-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 text-sm font-medium rounded-sm px-3 py-1.5 cursor-pointer min-w-[140px] focus:outline-none focus:border-accent/50"
                >
                  <option value="ALL">ALL TYPES</option>
                  {SSE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <ArrowUpDown className="h-4 w-4 text-zinc-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 text-sm font-medium rounded-sm px-3 py-1.5 cursor-pointer min-w-[140px] focus:outline-none focus:border-accent/50"
                >
                  <option value="DATE_DESC">NEWEST FIRST</option>
                  <option value="DATE_ASC">OLDEST FIRST</option>
                  <option value="OP_ASC">OPERATION (A-Z)</option>
                  <option value="OP_DESC">OPERATION (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── SSE LISTING ─── */}
      <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-sm overflow-hidden">
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-bold text-zinc-300 uppercase tracking-wider">
           <div className="col-span-1">Type</div>
           <div className="col-span-3">Item Name</div>
           <div className="col-span-2">Operation</div>
           <div className="col-span-2">Classification</div>
           <div className="col-span-2">Status &amp; Date</div>
           <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredItems.length === 0 ? (
             <div className="py-16 text-center">
                <Database className="h-10 w-10 mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-300 text-sm font-medium">NO RECORDS MATCH QUERY</p>
             </div>
          ) : (
             filteredItems.map(item => {
               const clr = getClassification(item.classification);
               const statusCfg = getSseStatus(item.status);
               return (
                <div key={item.id} className="relative group md:grid md:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-zinc-800/30 transition-colors">
                  
                  {/* Item Type Icon */}
                  <div className="col-span-1 mb-3 md:mb-0">
                    <div className="h-9 w-9 rounded-sm bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
                        {getCategoryIcon(item.type)}
                    </div>
                  </div>

                  {/* Item Name */}
                  <div className="col-span-3 min-w-0">
                     <h4 className="text-sm font-bold text-zinc-200 truncate">{item.name}</h4>
                     <p className="text-xs font-medium text-zinc-400 mt-1 uppercase tracking-wider">
                        SYS_ID: {item.id}
                     </p>
                  </div>

                  {/* Operation */}
                  <div className="col-span-2 min-w-0 md:my-0 my-2">
                     <p className="text-sm font-semibold text-accent truncate">{item.op}</p>
                  </div>

                  {/* Classification */}
                  <div className="col-span-2 my-2 md:my-0">
                     <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${clr.border} ${clr.text} ${clr.bg}`}>
                        {clr.label}
                     </Badge>
                  </div>

                  {/* Status & Date */}
                  <div className="col-span-2 text-sm md:my-0 my-2 flex flex-col items-start justify-center">
                     <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusCfg.text}`}>
                       {item.status}
                     </span>
                     <span className="text-zinc-300">{item.date}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex md:justify-end gap-2">
                     <Link href={`/operations/sse/${item.id}`} className="flex-1 md:flex-none">
                        <Button size="sm" variant="outline" className="w-full h-8 text-sm font-semibold border-zinc-700 text-zinc-200 hover:bg-accent/10 hover:text-accent hover:border-accent/40 bg-transparent">
                           <ExternalLink className="h-3.5 w-3.5 mr-1" /> VIEW
                        </Button>
                     </Link>
                  </div>
                </div>
               );
             })
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crosshair,
  MapPin,
  Clock,
  ShieldAlert,
  FolderLock,
  ChevronRight,
  Database,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_OPERATIONS,
  OP_STATUSES,
  getClassification,
  getOpStatus,
  type MockOperation,
} from "@/lib/config/operations";

export function OperationsClient({
  userCombatRecords = [],
}: {
  userCombatRecords?: { id: number; text: string; documentParsed?: any }[];
}) {
  const [activeTab, setActiveTab] = useState(OP_STATUSES[0].key);

  const participatedOps = MOCK_OPERATIONS.filter((op) => {
    if (userCombatRecords.length === 0) return false;
    return userCombatRecords.some((record) => {
      const searchSpace = `${record.text} ${JSON.stringify(record.documentParsed || {})}`.toLowerCase();
      if (searchSpace.includes(op.codename.toLowerCase())) return true;
      const opParts = op.codename.split(" ");
      if (opParts.length > 1 && searchSpace.includes(opParts[1].toLowerCase())) return true;
      return false;
    });
  });

  const filteredOps = participatedOps.filter((op) => op.status === activeTab);

  return (
    <div className="space-y-6">
      {/* ─── STATUS TABS ─── */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-4">
        {OP_STATUSES.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm transition-all border ${
              activeTab === tab.key
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600"
            }`}
          >
            {tab.tabLabel}
            <span className="ml-2 opacity-60">
              ({participatedOps.filter((o) => o.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* ─── OPERATIONS GRID ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredOps.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-zinc-900/40 border border-zinc-800/50 rounded-sm">
            <ShieldAlert className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-300 font-semibold text-base uppercase tracking-wider">
              NO OPERATIONS ON FILE FOR THIS STATUS
            </p>
          </div>
        ) : (
          filteredOps.map((op) => <OpCard key={op.id} op={op} />)
        )}
      </div>

      {/* ─── SSE LIBRARY LINK ─── */}
      <div className="pt-8">
        <Link href="/operations/sse">
          <Card className="bg-zinc-950/80 border border-zinc-800 rounded-sm hover:border-zinc-600 transition-colors group cursor-pointer relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <CardContent className="p-4 sm:p-6 flex items-center gap-5">
              <div className="h-12 w-12 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors">
                <Database className="h-6 w-6 text-zinc-400 group-hover:text-accent transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-zinc-100 uppercase tracking-wide group-hover:text-white transition-colors flex items-center gap-2">
                  Sensitive Site Exploitation (SSE) Repository
                  <FolderLock className="h-4 w-4 text-zinc-600" />
                </h4>
                <p className="text-base text-zinc-300 mt-1">
                  Access raw intel, seized media, and forensic data collected across all past and active operations.
                </p>
              </div>
              <div className="hidden sm:block">
                 <Badge variant="outline" className="text-xs font-semibold border-zinc-700 text-zinc-300 bg-zinc-900/50">
                   GLOBAL DB
                 </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
}

function OpCard({ op }: { op: MockOperation }) {
  const clr = getClassification(op.classification);
  const statusCfg = getOpStatus(op.status);

  return (
    <Link href={`/operations/${op.id}`}>
      <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm hover:border-zinc-500 hover:bg-zinc-900/80 transition-all group overflow-hidden cursor-pointer h-full relative">
        
        {/* Status Indicator Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusCfg.barColor}`} />

        <CardContent className="p-5 pl-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {statusCfg.pulse && (
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </div>
                )}
                <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wider group-hover:text-white transition-colors">
                  {op.codename}
                </h3>
              </div>
              <p className="text-sm text-zinc-300 flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                {op.ao}
              </p>
            </div>
            <Badge variant="outline" className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 ${clr.bg} ${clr.text} ${clr.border}`}>
              {clr.label}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-base text-zinc-300 line-clamp-2 min-h-[40px]">
              {op.brief}
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-sm text-zinc-300 font-medium">
                <Crosshair className="h-3.5 w-3.5 text-zinc-500" />
                {op.unit}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-300 font-medium hidden sm:flex">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                {op.dates}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-accent transition-colors translate-x-0 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

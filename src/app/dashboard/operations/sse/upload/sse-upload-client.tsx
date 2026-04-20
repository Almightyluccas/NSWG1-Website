"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  ChevronLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SSE_CATEGORIES } from "@/lib/config/operations";
import { type MockOperation } from "@/types/operations";
import { UserRole } from "@/types/database";

export function SseUploadClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ops, setOps] = useState<MockOperation[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchOps() {
      try {
        const res = await fetch("/api/operations");
        const data = await res.json();
        if (Array.isArray(data)) {
          setOps(data);
        } else {
          setOps([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchOps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          type: type || "OTHER",
          name,
          description,
          status: "LOGGED",
          minimumRole: UserRole.member,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload");
      }
      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard/operations/sse");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping opacity-20 bg-emerald-500 rounded-full" />
                <CheckCircle2 className="h-20 w-20 text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Payload Transfer Complete</h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest max-w-md">Evidence has been successfully aggregated into the SSE master registry.</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-500/50 text-[10px] uppercase font-bold tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Redirecting...
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl relative z-10">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <Link 
          href="/dashboard/operations/sse"
          className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          CANCEL & RETURN
        </Link>
      </div>

      <div className="bg-accent/10 border border-accent/30 shadow-[0_0_20px_rgba(var(--accent),0.1)] rounded-lg p-4 flex items-start gap-3 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/80 shadow-[0_0_10px_rgba(var(--accent),1)]" />
        <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">
            Data Integrity & OpSec Protocol
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed font-mono uppercase tracking-wider">
            Packages submitted via this uplink default to <span className="text-accent font-bold">TOP SECRET / PENDING REVIEW</span>. A designated Intelligence Officer or Command Admin will assign final clearances. <br/>This terminal is secured via NSA Suite B Cryptography (AES-256); cleared to transmit SCI / SAP payloads.
          </p>
        </div>
      </div>

      <Card className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-[0.3]" />

        <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 p-5 md:p-6 relative z-10 bg-white dark:bg-zinc-900/50">
          <CardTitle className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-accent" />
            UPLOAD EVIDENCE RECORD
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 md:p-6 relative z-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-200 font-mono">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset Designation / Identity</label>
                <Input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Encrypted Ledger, Seized Relay..." 
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 focus:border-accent/80 font-mono text-sm py-4 rounded-lg shadow-inner transition-colors"
                />
              </div>

              {/* Operation — pulled from shared config */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source Operation Node</label>
                <select 
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                >
                  <option value="" disabled className="text-zinc-600">Assign Operation...</option>
                  {ops.map((op) => (
                    <option key={op.id} value={op.id}>{op.codename || op.name}</option>
                  ))}
                </select>
              </div>

              {/* Category — pulled from shared config */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Material Category</label>
                <select 
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="" disabled className="text-zinc-600">Select Category...</option>
                  {SSE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Collected */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Acquisition Timestamp</label>
                <Input 
                  type="date"
                  required
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 font-mono text-sm py-4 rounded-lg shadow-inner transition-colors dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preliminary Findings / Extraction Context</label>
              <Textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Log physical condition, immediate intel value, or extraction parameters..."
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 min-h-[100px] focus:border-accent/80 font-mono text-sm p-4 rounded-lg shadow-inner transition-colors"
              />
            </div>

            {/* File Upload Mock */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Evidence File Attachment</label>
              <div className="relative border border-dashed border-zinc-200 dark:border-zinc-700 hover:border-accent/50 bg-white dark:bg-zinc-900/50 rounded-lg text-center transition-all cursor-pointer group overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 bottom-0 left-0 w-full bg-[linear-gradient(to_bottom,transparent,rgba(var(--accent),0.1),transparent)] -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
                
                <div className="relative z-10 py-8 px-4">
                    <div className="h-12 w-12 mx-auto bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-3 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(var(--accent),0.2)] transition-all">
                        <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-accent transition-colors" />
                    </div>
                    <p className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest drop-shadow-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">DRAG FILES HERE OR CLICK TO SELECT FROM DEVICE</p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-1.5 uppercase tracking-widest">SUPPORTED FILE TYPES: PDF, PNG, JPG, DOCX / MAX SIZE: 10MB</p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row justify-end gap-3">
              <Link href="/dashboard/operations/sse" className="w-full md:w-auto">
                <Button type="button" variant="outline" className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest h-10 px-8 transition-colors">
                  CANCEL
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto rounded-lg bg-accent hover:bg-accent/80 text-black font-black uppercase tracking-widest h-10 px-8 shadow-[0_0_15px_rgba(var(--accent),0.2)] hover:shadow-[0_0_25px_rgba(var(--accent),0.6)] transition-all disabled:opacity-70 disabled:pointer-events-none">
                {isSubmitting ? (
                    <span className="flex items-center gap-2 text-[10px]">
                        <span className="h-3 w-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        UPLOADING...
                    </span>
                ) : "UPLOAD EVIDENCE"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

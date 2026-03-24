"use client";

import { useState } from "react";
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
import { MOCK_OPERATIONS, SSE_CATEGORIES } from "@/lib/config/operations";

export function SseUploadClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/operations/sse");
      }, 2000);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/40 border border-zinc-800/80 rounded-sm">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-widest mb-2">Record Submitted</h2>
        <p className="text-zinc-300 text-sm">Your SSE upload has been logged and is pending classification review.</p>
        <p className="text-zinc-400 text-xs mt-4">Redirecting back to library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <Link 
          href="/operations/sse"
          className="inline-flex items-center text-sm font-semibold text-zinc-300 hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          BACK TO SSE LIBRARY
        </Link>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-700/60 rounded-sm p-4 flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-bold text-zinc-100 uppercase tracking-wide">
            Data Integrity Notice
          </p>
          <p className="text-base text-zinc-300 mt-1">
            All uploaded SSE items default to UNCLASSIFIED / PENDING REVIEW. A designated Intelligence Officer or Command Admin will assign the final classification level. Do not upload Top Secret materials on this unclassified terminal.
          </p>
        </div>
      </div>

      <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm">
        <CardHeader className="border-b border-zinc-800/60 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            SSE Record Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Item Name / Identity</label>
                <Input 
                  required
                  placeholder="e.g., Recovered Hard Drive, Encrypted Ledger" 
                  className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50"
                />
              </div>

              {/* Operation — pulled from shared config */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Source Operation</label>
                <select 
                  required
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm rounded-sm px-3 py-2 h-10 focus:border-accent/50 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Select Operation...</option>
                  {[...new Set(MOCK_OPERATIONS.map((op) => op.codename))].map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="OTHER">OTHER / UNKNOWN</option>
                </select>
              </div>

              {/* Category — pulled from shared config */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category / Type</label>
                <select 
                  required
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm rounded-sm px-3 py-2 h-10 focus:border-accent/50 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Select Category...</option>
                  {SSE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Collected */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date Collected</label>
                <Input 
                  type="date"
                  required
                  className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:border-accent/50 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description / Findings</label>
              <Textarea 
                required
                placeholder="Provide initial context, condition of item, and any immediate findings..."
                className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 min-h-[120px] focus:border-accent/50"
              />
            </div>

            {/* File Upload Mock */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Attach Files (Images/Docs)</label>
              <div className="border-2 border-dashed border-zinc-800 hover:border-accent/40 bg-zinc-900/30 rounded-sm p-8 text-center transition-colors cursor-pointer group">
                <UploadCloud className="h-8 w-8 mx-auto text-zinc-500 mb-3 group-hover:text-accent transition-colors" />
                <p className="text-sm font-semibold text-zinc-200">Click to upload or drag and drop</p>
                <p className="text-xs text-zinc-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex justify-end gap-3">
              <Link href="/operations/sse">
                <Button type="button" variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white bg-transparent">
                  CANCEL
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/80 text-black font-bold tracking-wider">
                {isSubmitting ? "PROCESSING..." : "SUBMIT RECORD"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  FileText,
} from "lucide-react";
import { FileDropZone, type UploadQueuedFile } from "@/components/operations/upload/file-drop-zone";

type OperationOption = {
  id: string;
  name: string;
  codename: string | null;
};

type MissionOption = {
  id: string;
  name: string;
};

type DocFormState = {
  title: string;
  docType: string;
  classification: string;
  date: string;
  description: string;
};

const initialForm: DocFormState = {
  title: "",
  docType: "CONOP",
  classification: "UNCLASSIFIED",
  date: "",
  description: "",
};

export function DocUploadClient({
  initialCampaignId,
  initialMissionId,
}: {
  initialCampaignId?: string;
  initialMissionId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ops, setOps] = useState<OperationOption[]>([]);
  const [missions, setMissions] = useState<MissionOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId ?? "");
  const [selectedMissionId, setSelectedMissionId] = useState(initialMissionId ?? "");
  const [queuedFiles, setQueuedFiles] = useState<UploadQueuedFile[]>([]);
  const [form, setForm] = useState<DocFormState>(initialForm);

  const hasPrefilledOwner = Boolean(initialCampaignId || initialMissionId);

  const selectedOperationLabel = useMemo(() => {
    const op = ops.find((item) => item.id === selectedCampaignId);
    return op?.codename || op?.name || "UNKNOWN OPERATION";
  }, [ops, selectedCampaignId]);

  const selectedMissionLabel = useMemo(() => {
    const mission = missions.find((item) => item.id === selectedMissionId);
    return mission?.name || "";
  }, [missions, selectedMissionId]);

  useEffect(() => {
    async function fetchOps() {
      try {
        const res = await fetch("/api/operations");
        const data = await res.json();
        if (Array.isArray(data)) {
          setOps(
            data.map((op) => ({
              id: String(op.id),
              name: String(op.name ?? ""),
              codename: op.codename ?? null,
            })),
          );
        } else {
          setOps([]);
        }
      } catch (fetchError) {
        console.error(fetchError);
      }
    }
    fetchOps();
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) {
      setMissions([]);
      setSelectedMissionId("");
      return;
    }

    async function fetchCampaignMissions() {
      try {
        const res = await fetch(`/api/operations/${selectedCampaignId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load campaign missions");
        }
        const list = Array.isArray(data?.missions)
          ? data.missions.map((mission: any) => ({
              id: String(mission.id),
              name: String(mission.name ?? "Unnamed mission"),
            }))
          : [];
        setMissions(list);
      } catch (fetchError) {
        console.error(fetchError);
        setMissions([]);
      }
    }

    fetchCampaignMissions();
  }, [selectedCampaignId]);

  useEffect(() => {
    if (missions.length === 0) {
      setSelectedMissionId("");
      return;
    }

    const stillExists = missions.some((mission) => mission.id === selectedMissionId);
    if (!stillExists) {
      const prefilledExists = initialMissionId
        ? missions.some((mission) => mission.id === initialMissionId)
        : false;
      setSelectedMissionId(prefilledExists ? initialMissionId! : "");
    }
  }, [missions, selectedMissionId, initialMissionId]);

  const handleFileInput = (files: File[]) => {
    if (!files.length) return;
    const incoming: UploadQueuedFile[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "queued",
    }));
    setQueuedFiles((prev) => [...prev, ...incoming]);
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((entry) => entry.id !== id));
  };

  const uploadFileToStorage = async (file: File): Promise<{ key: string; fileType: string; fileSize: string }> => {
    const presignRes = await fetch("/api/object-storage/generate-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadType: "document",
        contentType: file.type || "application/octet-stream",
      }),
    });
    if (!presignRes.ok) {
      const data = await presignRes.json().catch(() => ({}));
      throw new Error(data.error || "Unable to acquire upload URL");
    }
    const { url, key } = await presignRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Storage transfer failed");
    }

    return {
      key,
      fileType: file.type || "application/octet-stream",
      fileSize: String(file.size),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !form.title.trim()) {
      setError("Select an operation and provide a document title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setQueuedFiles((prev) => prev.map((item) => ({ ...item, status: "uploading", error: undefined })));

    try {
      let uploaded: { key: string; fileType: string; fileSize: string } | null = null;
      if (queuedFiles.length > 0) {
        uploaded = await uploadFileToStorage(queuedFiles[0].file);
      }

      const response = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          missionId: selectedMissionId || null,
          title: form.title.trim(),
          docType: form.docType.trim() || "OTHER",
          classification: form.classification.trim() || "UNCLASSIFIED",
          date: form.date || null,
          fileUrl: uploaded?.key || "",
          fileType: uploaded?.fileType,
          fileSize: uploaded?.fileSize,
          description: form.description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create planning doc.");
      }

      setQueuedFiles((prev) => prev.map((item) => ({ ...item, status: "done" })));
      setSubmitted(true);
      setTimeout(() => {
        router.push(`/dashboard/operations/${selectedCampaignId}`);
      }, 1600);
    } catch (submitError: any) {
      setQueuedFiles((prev) => prev.map((item) => ({ ...item, status: "failed", error: "Upload failed" })));
      setError(submitError?.message || "Upload failed.");
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
          <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Document Registered</h2>
          <p className="text-zinc-400 text-sm uppercase tracking-widest max-w-md">
            Planning document metadata has been added to the operation registry.
          </p>
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
          href={selectedCampaignId ? `/dashboard/operations/${selectedCampaignId}` : "/dashboard/operations"}
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
            Docs Intake // Operations Registry
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed font-mono uppercase tracking-wider">
            Upload a planning document and link it directly to the operation repository.
          </p>
        </div>
      </div>

      {hasPrefilledOwner && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-accent" />
          Prefilled Target Loaded (Editable) // {selectedOperationLabel}
          {selectedMissionLabel ? ` › ${selectedMissionLabel}` : ""}
        </div>
      )}

      <Card className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-[0.3]" />

        <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 p-5 md:p-6 relative z-10 bg-white dark:bg-zinc-900/50">
          <CardTitle className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            Upload Planning Document
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source Operation (Required)</label>
                <select
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                    setSelectedMissionId("");
                  }}
                >
                  <option value="" disabled className="text-zinc-600">Assign Operation...</option>
                  {ops.map((op) => (
                    <option key={op.id} value={op.id}>{op.codename || op.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission (Optional)</label>
                <select
                  disabled={!selectedCampaignId}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedMissionId}
                  onChange={(e) => setSelectedMissionId(e.target.value)}
                >
                  <option value="">Campaign-level document</option>
                  {missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>{mission.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Document Title (Required)</label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-10 px-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 text-sm rounded-lg transition-colors"
                  placeholder="CONOP // Operation Trident"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Doc Type</label>
                <Input
                  value={form.docType}
                  onChange={(e) => setForm((prev) => ({ ...prev, docType: e.target.value }))}
                  className="h-10 px-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 text-sm rounded-lg transition-colors"
                  placeholder="CONOP / WARNO / FRAGO"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Classification</label>
                <Input
                  value={form.classification}
                  onChange={(e) => setForm((prev) => ({ ...prev, classification: e.target.value }))}
                  className="h-10 px-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 text-sm rounded-lg transition-colors"
                  placeholder="UNCLASSIFIED / SECRET"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-10 px-3 pr-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 text-sm rounded-lg transition-colors dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:mr-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief context for this planning document..."
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 min-h-[100px] focus:border-accent/80 font-mono text-sm p-4 rounded-lg shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Attach Files (Optional)</label>
              <FileDropZone
                files={queuedFiles}
                onFilesAdded={handleFileInput}
                onRemove={removeQueuedFile}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                multiple
                disabled={isSubmitting}
                label="Drop files here or click to queue attachments"
                hint="SUPPORTED: PDF, DOCX, PPTX, TXT"
                showImagePreviews={false}
                isTransferring={isSubmitting}
                transferCount={queuedFiles.length}
              />
            </div>

            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row justify-end gap-3">
              <Link
                href={selectedCampaignId ? `/dashboard/operations/${selectedCampaignId}` : "/dashboard/operations"}
                className="w-full md:w-auto"
              >
                <Button type="button" variant="outline" className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest h-10 px-8 transition-colors">
                  CANCEL
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedCampaignId || !form.title.trim()}
                className="w-full md:w-auto rounded-lg bg-accent hover:bg-accent/80 text-black font-black uppercase tracking-widest h-10 px-8 shadow-[0_0_15px_rgba(var(--accent),0.2)] hover:shadow-[0_0_25px_rgba(var(--accent),0.6)] transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 text-[10px]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    REGISTERING DOC...
                  </span>
                ) : "REGISTER DOCUMENT"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

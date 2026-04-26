"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import {
  FileDropZone,
  type UploadQueuedFile,
} from "@/components/operations/upload/file-drop-zone";

type OperationOption = {
  id: string;
  name: string;
  codename: string | null;
};

type MissionOption = {
  id: string;
  name: string;
};

type QueuedImage = UploadQueuedFile & { previewUrl: string };

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 1,
};

function getTodayIsoDate(): string {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export function SseUploadClient({
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
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaignId ?? ""
  );
  const [selectedMissionId, setSelectedMissionId] = useState(
    initialMissionId ?? ""
  );
  const [dumpNote, setDumpNote] = useState("");
  const [collectedDate, setCollectedDate] = useState(getTodayIsoDate());
  const [queuedImages, setQueuedImages] = useState<QueuedImage[]>([]);
  const [transferCount, setTransferCount] = useState(0);
  const [transferErrors, setTransferErrors] = useState(0);

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
            }))
          );
        } else {
          setOps([]);
        }
      } catch (err) {
        console.error(err);
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
      } catch (err) {
        console.error(err);
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

    const stillExists = missions.some(
      (mission) => mission.id === selectedMissionId
    );
    if (!stillExists) {
      const prefilledExists = initialMissionId
        ? missions.some((mission) => mission.id === initialMissionId)
        : false;
      setSelectedMissionId(
        prefilledExists ? initialMissionId! : missions[0].id
      );
    }
  }, [missions, selectedMissionId, initialMissionId]);

  const handleFileInput = (files: File[]) => {
    if (!files.length) return;

    const incoming: QueuedImage[] = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
      }));

    setQueuedImages((prev) => [...prev, ...incoming]);
  };

  useEffect(() => {
    return () => {
      queuedImages.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    };
  }, [queuedImages]);

  const removeQueuedImage = (id: string) => {
    setQueuedImages((prev) => {
      const target = prev.find((entry) => entry.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const uploadOne = async (entry: QueuedImage) => {
    const compressedFile = await imageCompression(
      entry.file,
      IMAGE_COMPRESSION_OPTIONS
    );

    const presignRes = await fetch("/api/object-storage/generate-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadType: "sse",
        contentType: compressedFile.type,
      }),
    });
    if (!presignRes.ok) {
      const data = await presignRes.json().catch(() => ({}));
      throw new Error(data.error || "Unable to acquire upload URL");
    }
    const { url, key } = await presignRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": compressedFile.type },
      body: compressedFile,
    });
    if (!putRes.ok) {
      throw new Error("Storage transfer failed");
    }

    const sseRes = await fetch("/api/sse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: selectedCampaignId,
        missionId: selectedMissionId || null,
        type: "MEDIA",
        name: entry.file.name,
        description: dumpNote,
        status: "LOGGED",
        imageUrl: key,
        collectedDate: collectedDate || null,
      }),
    });
    if (!sseRes.ok) {
      const data = await sseRes.json().catch(() => ({}));
      throw new Error(data.error || "Failed to register SSE row");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || queuedImages.length === 0) {
      setError("Select an operation and queue at least one image.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTransferCount(0);
    setTransferErrors(0);

    try {
      for (const entry of queuedImages) {
        setQueuedImages((prev) =>
          prev.map((item) =>
            item.id === entry.id
              ? { ...item, status: "uploading", error: undefined }
              : item
          )
        );
        try {
          await uploadOne(entry);
          setQueuedImages((prev) =>
            prev.map((item) =>
              item.id === entry.id ? { ...item, status: "done" } : item
            )
          );
          setTransferCount((prev) => prev + 1);
        } catch (entryError: any) {
          setQueuedImages((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? {
                    ...item,
                    status: "failed",
                    error: entryError?.message || "Upload failed",
                  }
                : item
            )
          );
          setTransferErrors((prev) => prev + 1);
        }
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
          <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">
            Payload Transfer Complete
          </h2>
          <p className="text-zinc-400 text-sm uppercase tracking-widest max-w-md">
            {transferCount} frame(s) ingested.{" "}
            {transferErrors > 0
              ? `${transferErrors} failed.`
              : "All transfers successful."}
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
            Field Terminal // SD Card Ingest
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed font-mono uppercase tracking-wider">
            Drops auto-log as{" "}
            <span className="text-accent font-bold">PENDING REVIEW</span>.
            Uploaded material is tied to selected operation/mission and uploader
            identity.
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Source Operation (Required)
                </label>
                <select
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                    setSelectedMissionId("");
                  }}
                >
                  <option value="" disabled className="text-zinc-600">
                    Assign Operation...
                  </option>
                  {ops.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.codename || op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Mission (Required)
                </label>
                <select
                  required
                  disabled={!selectedCampaignId}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold tracking-wider rounded-lg px-3 py-2 h-10 flex items-center focus:border-accent/80 focus:ring-1 focus:ring-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedMissionId}
                  onChange={(e) => setSelectedMissionId(e.target.value)}
                >
                  <option value="" disabled>
                    Select mission...
                  </option>
                  {missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Collected Date (Optional)
                </label>
                <Input
                  type="date"
                  value={collectedDate}
                  onChange={(e) => setCollectedDate(e.target.value)}
                  className="h-10 px-3 pr-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:border-accent/80 text-sm rounded-lg transition-colors dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:mr-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Dump Note (Optional)
              </label>
              <Textarea
                value={dumpNote}
                onChange={(e) => setDumpNote(e.target.value)}
                placeholder="Quick context applied to each uploaded frame..."
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 min-h-[100px] focus:border-accent/80 font-mono text-sm p-4 rounded-lg shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Drop Screenshots (Required)
              </label>
              <FileDropZone
                files={queuedImages}
                onFilesAdded={handleFileInput}
                onRemove={removeQueuedImage}
                accept="image/*"
                multiple
                disabled={isSubmitting}
                label="Drop images here or click to load SD dump"
                hint="SUPPORTED: JPG, PNG, WEBP, GIF"
                showImagePreviews
                isTransferring={isSubmitting}
                transferCount={transferCount + transferErrors}
              />
            </div>

            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row justify-end gap-3">
              <Link
                href="/dashboard/operations/sse"
                className="w-full md:w-auto"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest h-10 px-8 transition-colors"
                >
                  CANCEL
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedCampaignId ||
                  !selectedMissionId ||
                  queuedImages.length === 0
                }
                className="w-full md:w-auto rounded-lg bg-accent hover:bg-accent/80 text-black font-black uppercase tracking-widest h-10 px-8 shadow-[0_0_15px_rgba(var(--accent),0.2)] hover:shadow-[0_0_25px_rgba(var(--accent),0.6)] transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 text-[10px]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    TRANSFERRING FRAMES...
                  </span>
                ) : (
                  "INGEST SD DUMP"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { UploadCloud, X, FileText } from "lucide-react";
import Image from "next/image";

export type UploadQueuedFile = {
  id: string;
  file: File;
  previewUrl?: string;
  status: "queued" | "uploading" | "done" | "failed";
  error?: string;
};

type FileDropZoneProps = {
  files: UploadQueuedFile[];
  onFilesAdded: (files: File[]) => void;
  onRemove: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  showImagePreviews?: boolean;
  isTransferring?: boolean;
  transferCount?: number;
};

export function FileDropZone({
  files,
  onFilesAdded,
  onRemove,
  accept = "*/*",
  multiple = true,
  disabled = false,
  label = "Drop files here or click to select",
  hint = "SUPPORTED: ALL FILE TYPES",
  showImagePreviews = false,
  isTransferring = false,
  transferCount = 0,
}: FileDropZoneProps) {
  return (
    <div className="space-y-1.5">
      <label className="relative block border border-dashed border-zinc-200 dark:border-zinc-700 hover:border-accent/50 bg-white dark:bg-zinc-900/50 rounded-lg text-center transition-all cursor-pointer group overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 bottom-0 left-0 w-full bg-[linear-gradient(to_bottom,transparent,rgba(var(--accent),0.1),transparent)] -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
        <div className="relative z-10 py-8 px-4">
          <div className="h-12 w-12 mx-auto bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-3 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(var(--accent),0.2)] transition-all">
            <UploadCloud className="h-5 w-5 text-zinc-500 group-hover:text-accent transition-colors" />
          </div>
          <p className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest drop-shadow-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {label}
          </p>
          <p className="text-[9px] text-zinc-500 font-mono mt-1.5 uppercase tracking-widest">{hint}</p>
        </div>
        <Input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const selected = e.target.files ? Array.from(e.target.files) : [];
            if (selected.length > 0) {
              onFilesAdded(selected);
            }
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {isTransferring
              ? `TRANSFERRING ${transferCount}/${files.length} FILES`
              : `${files.length} file(s) queued`}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {files.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 space-y-2">
                {showImagePreviews ? (
                  <div className="relative aspect-video rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    {entry.previewUrl ? (
                      <Image
                        src={entry.previewUrl}
                        alt={entry.file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                        <FileText className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
                <p className="text-[10px] text-zinc-500 font-mono truncate">{entry.file.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">
                    {entry.status === "uploading"
                      ? "Uploading"
                      : entry.status === "done"
                        ? "Done"
                        : entry.status === "failed"
                          ? "Failed"
                          : "Queued"}
                  </span>
                  {!isTransferring && !disabled && (
                    <button type="button" onClick={() => onRemove(entry.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {entry.error ? <p className="text-[9px] text-red-400">{entry.error}</p> : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileDropZone, type UploadQueuedFile } from "@/components/operations/upload/file-drop-zone";
import { UserRole } from "@/types/database";
import { useDocumentUpload } from "@/lib/documents/useDocumentUpload";

const roleOptions = Object.values(UserRole);

export function DocumentsUploadClient() {
  const router = useRouter();
  const { uploadDocument, isUploading } = useDocumentUpload();
  const [files, setFiles] = useState<UploadQueuedFile[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState("GENERAL");
  const [classification, setClassification] = useState("GENERAL");
  const [unit, setUnit] = useState("NSWG1 HQ");
  const [minimumRole, setMinimumRole] = useState(UserRole.member);
  const [tagsInput, setTagsInput] = useState("");
  const [allowedUsersInput, setAllowedUsersInput] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tags = useMemo(
    () => tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    [tagsInput]
  );
  const allowedUsers = useMemo(
    () => allowedUsersInput.split(",").map((u) => u.trim()).filter(Boolean),
    [allowedUsersInput]
  );

  const onFilesAdded = (incoming: File[]) => {
    const queued = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "queued" as const,
    }));
    setFiles((prev) => [...prev, ...queued]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const toggleAllowedRole = (role: string) => {
    setAllowedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError("Please queue at least one file.");
      return;
    }

    try {
      for (const entry of files) {
        await uploadDocument(entry.file, {
          name: name.trim() || entry.file.name,
          description,
          docType,
          classification,
          unit,
          minimumRole,
          tags,
          allowedRoles,
          allowedUsers,
        });
      }
      router.push("/dashboard/documents");
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to upload documents.");
    }
  };

  return (
    <Card className="max-w-4xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg">
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/80">
        <CardTitle className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">
          Document Intake Form
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 md:p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center text-[10px] font-bold text-zinc-500 hover:text-accent uppercase tracking-widest"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back to Documents Center
          </Link>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name" />
            <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="Doc type" />
            <Input value={classification} onChange={(e) => setClassification(e.target.value)} placeholder="Classification" />
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
            <select
              value={minimumRole}
              onChange={(e) => setMinimumRole(e.target.value as typeof minimumRole)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 h-10 px-3 text-sm"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags (comma-separated)" />
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="min-h-[110px]"
          />

          <Input
            value={allowedUsersInput}
            onChange={(e) => setAllowedUsersInput(e.target.value)}
            placeholder="Allowed user IDs (comma-separated, optional)"
          />

          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleAllowedRole(role)}
                className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
                  allowedRoles.includes(role)
                    ? "border-accent bg-accent/20"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <FileDropZone
            files={files}
            onFilesAdded={onFilesAdded}
            onRemove={removeFile}
            multiple
            disabled={isUploading}
            isTransferring={isUploading}
            transferCount={files.length}
            hint="PDF, DOCX, XLSX, PPTX, TXT, CSV, IMAGES"
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isUploading || files.length === 0}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Documents"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

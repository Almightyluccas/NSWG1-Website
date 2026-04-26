"use client";

import { useState } from "react";

type UploadPayload = {
  name: string;
  description?: string;
  docType?: string;
  classification?: string;
  unit?: string;
  minimumRole?: string;
  tags?: string[];
  allowedRoles?: string[];
  allowedUsers?: string[];
};

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (file: File, payload: UploadPayload) => {
    setIsUploading(true);
    try {
      const presignRes = await fetch(
        "/api/object-storage/generate-upload-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadType: "document",
            contentType: file.type || "application/octet-stream",
          }),
        }
      );
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate upload URL");
      }
      const { url, key } = await presignRes.json();

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("Failed to upload to object storage");
      }

      const createRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          fileKey: key,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });
      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save document metadata");
      }
      return createRes.json();
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadDocument, isUploading };
}

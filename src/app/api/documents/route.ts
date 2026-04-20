import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { type DocumentItem } from "@/types/documents";
import { UserRole } from "@/types/database";

const DOCUMENTS_ROOT = path.resolve(process.cwd(), "public", "documents");

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function getPreviewPath(type: string): string {
  if (type === "PDF") return "/document-previews/pdf.svg";
  if (type === "DOC" || type === "DOCX") return "/document-previews/doc.svg";
  if (type === "XLS" || type === "XLSX" || type === "CSV") return "/document-previews/sheet.svg";
  return "/document-previews/file.svg";
}

async function listDocumentFiles(rootDir: string): Promise<string[]> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) {
        return listDocumentFiles(fullPath);
      }
      return [fullPath];
    }),
  );
  return paths.flat();
}

export async function GET() {
  try {
    const files = await listDocumentFiles(DOCUMENTS_ROOT);
    const docs = await Promise.all(
      files.map(async (absolutePath, index) => {
        const stats = await fs.stat(absolutePath);
        const relativePath = path
          .relative(DOCUMENTS_ROOT, absolutePath)
          .split(path.sep)
          .map((segment) => encodeURIComponent(segment))
          .join("/");
        const baseName = path.basename(absolutePath);
        const nameWithoutExt = baseName.replace(/\.[^.]+$/, "");
        const ext = path.extname(baseName).replace(".", "").toUpperCase() || "FILE";

        const doc: DocumentItem = {
          id: String(index + 1),
          name: nameWithoutExt,
          classification: "GENERAL",
          unit: "NSWG1 HQ",
          type: ext,
          size: formatFileSize(stats.size),
          lastModified: stats.mtime.toISOString().slice(0, 10),
          author: "System",
          description: `${ext} document from public/documents`,
          docNumber: nameWithoutExt.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
          path: `/api/documents/file/${relativePath}`,
          previewPath: getPreviewPath(ext),
          minimumRole: UserRole.member,
        };
        return doc;
      }),
    );

    docs.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Failed to list documents:", error);
    return NextResponse.json([]);
  }
}

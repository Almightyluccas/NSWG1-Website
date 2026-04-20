import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function toSafeAbsolutePath(pathSegments: string[]): string | null {
  const documentsRoot = path.resolve(process.cwd(), "public", "documents");
  const requestedPath = path.resolve(documentsRoot, ...pathSegments);

  if (
    requestedPath !== documentsRoot &&
    !requestedPath.startsWith(`${documentsRoot}${path.sep}`)
  ) {
    return null;
  }

  return requestedPath;
}

function resolveMimeType(filePath: string): string {
  const ext = path.extname(filePath).replace(".", "").toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await context.params;
  const targetPath = toSafeAbsolutePath(pathSegments);

  if (!targetPath) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const stats = await fs.stat(targetPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const totalSize = stats.size;
    const mimeType = resolveMimeType(targetPath);
    const baseHeaders = {
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${path.basename(targetPath)}"`,
    };

    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const startRaw = match[1];
      const endRaw = match[2];
      let start: number;
      let end: number;

      if (startRaw === "" && endRaw === "") {
        return new NextResponse(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      if (startRaw === "") {
        const suffixLength = Number.parseInt(endRaw, 10);
        if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
          return new NextResponse(null, {
            status: 416,
            headers: {
              ...baseHeaders,
              "Content-Range": `bytes */${totalSize}`,
            },
          });
        }
        start = Math.max(totalSize - suffixLength, 0);
        end = totalSize - 1;
      } else {
        start = Number.parseInt(startRaw, 10);
        end = endRaw ? Number.parseInt(endRaw, 10) : totalSize - 1;
      }

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end < start ||
        start >= totalSize
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const boundedEnd = Math.min(end, totalSize - 1);
      const chunk = await fs.readFile(targetPath);
      const sliced = chunk.subarray(start, boundedEnd + 1);

      return new NextResponse(new Uint8Array(sliced), {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Length": String(sliced.byteLength),
          "Content-Range": `bytes ${start}-${boundedEnd}/${totalSize}`,
        },
      });
    }

    const fileBuffer = await fs.readFile(targetPath);
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Length": String(fileBuffer.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const response = await GET(request, context);
  if (!response.ok) {
    return response;
  }

  return new NextResponse(null, {
    status: 200,
    headers: response.headers,
  });
}

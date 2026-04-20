"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { logDocumentAccess } from "@/app/dashboard/documents/action";
import Image from "next/image";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface DocumentViewerProps {
  documentPath: string;
}

export default function DocumentViewer({ documentPath }: DocumentViewerProps) {
  const router = useRouter();
  const [documentExists, setDocumentExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [sheetRowsByName, setSheetRowsByName] = useState<Record<string, string[][]>>({});
  const [textPreview, setTextPreview] = useState<string>("");
  const [csvRows, setCsvRows] = useState<string[][]>([]);

  const normalizedPath = documentPath.replace(/^\/+/, "").replace(/^documents\//i, "");
  const encodedPath = normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const fullPath = `/api/documents/file/${encodedPath}`;
  const fileName = (() => {
    const rawName = documentPath.split("/").pop() || "";
    try {
      return decodeURIComponent(rawName);
    } catch {
      return rawName;
    }
  })();
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const isPdf = fileExtension === "pdf";
  const isDocx = fileExtension === "docx";
  const isSpreadsheet = fileExtension === "xlsx" || fileExtension === "xls";
  const isPowerPoint = fileExtension === "pptx" || fileExtension === "ppt";
  const isImage =
    fileExtension === "png" ||
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "gif" ||
    fileExtension === "webp" ||
    fileExtension === "svg";
  const isCsv = fileExtension === "csv";
  const isText = fileExtension === "txt" || fileExtension === "md";
  const absoluteFileUrl =
    typeof window !== "undefined" ? `${window.location.origin}${fullPath}` : "";
  const canUseMicrosoftViewer =
    isPowerPoint &&
    typeof window !== "undefined" &&
    !["localhost", "127.0.0.1"].includes(window.location.hostname);
  const microsoftViewerUrl = canUseMicrosoftViewer
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteFileUrl)}`
    : "";

  useEffect(() => {
    const checkDocument = async () => {
      const isValidFileResponse = (response: Response) => {
        const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
        const isHtmlResponse = contentType.includes("text/html");
        const isPdfType =
          fileExtension === "pdf"
            ? contentType.length === 0 ||
              contentType.includes("pdf") ||
              contentType.includes("application/pdf") ||
              contentType.includes("application/octet-stream") ||
              contentType.includes("binary")
            : true;

        return response.ok && !isHtmlResponse && isPdfType;
      };

      try {
        let exists = false;

        const headResponse = await fetch(fullPath, { method: "HEAD", cache: "no-store" });
        exists = isValidFileResponse(headResponse);

        // Some environments/proxies handle HEAD poorly for static files.
        // Fall back to a tiny ranged GET probe before marking as missing.
        if (!exists) {
          const getProbe = await fetch(fullPath, {
            method: "GET",
            headers: { Range: "bytes=0-0" },
            cache: "no-store",
          });
          exists = isValidFileResponse(getProbe);
        }

        setDocumentExists(exists);

        if (exists) {
          await logDocumentAccess(fullPath, fileName, "view");
        }
      } catch (error) {
        console.error("Error checking document:", error);
        setDocumentExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDocument();
  }, [fileExtension, fileName, fullPath]);

  useEffect(() => {
    const loadPreview = async () => {
      setPreviewError(null);
      setDocxHtml("");
      setSheetNames([]);
      setActiveSheet("");
      setSheetRowsByName({});
      setTextPreview("");
      setCsvRows([]);

      if (!documentExists) {
        return;
      }

      if (!(isDocx || isSpreadsheet || isCsv || isText)) {
        return;
      }

      try {
        setPreviewLoading(true);
        const response = await fetch(fullPath, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load document preview.");
        }

        if (isDocx) {
          const arrayBuffer = await response.arrayBuffer();
          const { value } = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(value);
          return;
        }

        if (isSpreadsheet) {
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const names = workbook.SheetNames;
          const rowsByName: Record<string, string[][]> = {};

          names.forEach((name) => {
            const sheet = workbook.Sheets[name];
            const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
              header: 1,
              raw: false,
              defval: "",
            });
            rowsByName[name] = rows.map((row) => row.map((cell) => String(cell ?? "")));
          });

          setSheetNames(names);
          setSheetRowsByName(rowsByName);
          setActiveSheet(names[0] ?? "");
          return;
        }

        if (isCsv) {
          const text = await response.text();
          const workbook = XLSX.read(text, { type: "string" });
          const firstSheetName = workbook.SheetNames[0];
          const firstSheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(firstSheet, {
            header: 1,
            raw: false,
            defval: "",
          });
          setCsvRows(rows.map((row) => row.map((cell) => String(cell ?? ""))));
          return;
        }

        if (isText) {
          const text = await response.text();
          setTextPreview(text);
        }
      } catch (error) {
        console.error("Error loading document preview:", error);
        setPreviewError("Preview failed to load. Please download the file to view it.");
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview();
  }, [documentExists, fullPath, isCsv, isDocx, isSpreadsheet, isText]);

  const renderTable = (rows: string[][]) => {
    if (!rows.length) {
      return <p className="text-sm text-muted-foreground">No table data found.</p>;
    }

    const header = rows[0] ?? [];
    const body = rows.slice(1);

    return (
      <div className="overflow-auto rounded-md border border-zinc-300 dark:border-zinc-700">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              {header.map((cell, index) => (
                <th
                  key={`header-${index}`}
                  className="px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-300 dark:border-zinc-700"
                >
                  {cell || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-950 dark:even:bg-zinc-900">
                {header.map((_, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-3 py-2 align-top text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800"
                  >
                    {row[cellIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fullPath);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      await logDocumentAccess(fullPath, fileName, "download");
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading document...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documentExists) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Document Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The document &quot;{fileName}&quot; could not be found or is no longer
              available.
            </p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Document Viewer
              </p>
              <CardTitle className="flex items-center gap-2 mt-1">
                <FileText className="h-5 w-5" />
                {fileName}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/documents")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Documents Center
              </Button>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isPdf ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg overflow-hidden bg-black">
              <iframe
                src={`${fullPath}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={fileName}
              />
            </div>
          ) : isImage ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg overflow-auto bg-zinc-950/95 p-4">
              <Image
                src={fullPath}
                alt={fileName}
                width={1800}
                height={2400}
                unoptimized
                className="max-w-full max-h-full h-auto w-auto mx-auto rounded"
              />
            </div>
          ) : isDocx ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg bg-white overflow-auto">
              {previewLoading ? (
                <div className="h-full w-full flex items-center justify-center p-6">
                  <p className="text-sm text-muted-foreground">Rendering Word document...</p>
                </div>
              ) : previewError ? (
                <div className="h-full w-full flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{previewError}</p>
                    <Button onClick={handleDownload} className="flex items-center gap-2 mx-auto">
                      <Download className="h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none p-6">
                  <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
                </div>
              )}
            </div>
          ) : isSpreadsheet ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
              {sheetNames.length > 0 && (
                <div className="border-b border-zinc-300 dark:border-zinc-700 p-2 flex flex-wrap gap-2">
                  {sheetNames.map((sheetName) => (
                    <Button
                      key={sheetName}
                      variant={activeSheet === sheetName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSheet(sheetName)}
                    >
                      {sheetName}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-auto p-4">
                {previewLoading ? (
                  <div className="h-full w-full flex items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">Rendering spreadsheet...</p>
                  </div>
                ) : previewError ? (
                  <div className="h-full w-full flex items-center justify-center p-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">{previewError}</p>
                      <Button onClick={handleDownload} className="flex items-center gap-2 mx-auto">
                        <Download className="h-4 w-4" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                ) : activeSheet ? (
                  renderTable(sheetRowsByName[activeSheet] ?? [])
                ) : (
                  <p className="text-sm text-muted-foreground">No worksheet data found.</p>
                )}
              </div>
            </div>
          ) : isCsv ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg bg-white dark:bg-zinc-950 overflow-auto p-4">
              {previewLoading ? (
                <div className="h-full w-full flex items-center justify-center p-6">
                  <p className="text-sm text-muted-foreground">Rendering CSV table...</p>
                </div>
              ) : previewError ? (
                <div className="h-full w-full flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{previewError}</p>
                    <Button onClick={handleDownload} className="flex items-center gap-2 mx-auto">
                      <Download className="h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              ) : (
                renderTable(csvRows)
              )}
            </div>
          ) : isText ? (
            <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg overflow-auto bg-zinc-950 p-4">
              {previewLoading ? (
                <div className="h-full w-full flex items-center justify-center p-6">
                  <p className="text-sm text-zinc-300">Loading text preview...</p>
                </div>
              ) : previewError ? (
                <div className="h-full w-full flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-sm text-zinc-300 mb-3">{previewError}</p>
                    <Button onClick={handleDownload} className="flex items-center gap-2 mx-auto">
                      <Download className="h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              ) : (
                <pre className="text-xs md:text-sm text-zinc-100 whitespace-pre-wrap break-words font-mono">
                  {textPreview}
                </pre>
              )}
            </div>
          ) : isPowerPoint ? (
            <div className="space-y-4">
              {canUseMicrosoftViewer ? (
                <div className="w-full min-h-[70vh] h-[calc(100vh-260px)] border rounded-lg overflow-hidden bg-zinc-950">
                  <iframe
                    src={microsoftViewerUrl}
                    title={`${fileName} preview`}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PPTX Preview Unavailable Locally</h3>
                  <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                    PowerPoint web preview needs a publicly reachable file URL. On localhost,
                    please use download or open in a new tab.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(fullPath, "_blank", "noopener,noreferrer")}
                    >
                      Open Raw File
                    </Button>
                    <Button onClick={handleDownload} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Preview Not Available
              </h3>
              <p className="text-muted-foreground mb-4">
                This document type cannot be previewed in the browser.
              </p>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 mx-auto"
              >
                <Download className="h-4 w-4" />
                Download to View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

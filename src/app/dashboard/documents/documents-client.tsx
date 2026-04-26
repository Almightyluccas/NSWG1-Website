"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Download,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  type DocumentClassification,
  type DocumentItem,
} from "@/types/documents";
import { UserRole } from "@/types/database";

type ClassificationLevel = DocumentClassification;

const classificationConfig: Record<
  ClassificationLevel,
  {
    label: string;
    badgeClass: string;
  }
> = {
  GENERAL: {
    label: "MEMBER",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
  UNIT_CONFIDENTIAL: {
    label: "TACDEVRON",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
  SECRET: {
    label: "160TH",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
  TOP_SECRET: {
    label: "J-2",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
  LEADERSHIP: {
    label: "LEADERSHIP",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
  GREEN_TEAM: {
    label: "GREENTEAM",
    badgeClass:
      "border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300",
  },
};

const allUnits = ["NSWG1 HQ", "SEAL Team 2", "TACDEVRON 2", "Task Force 160th"];
const classificationLevels: ClassificationLevel[] = [
  "GENERAL",
  "UNIT_CONFIDENTIAL",
  "SECRET",
  "TOP_SECRET",
  "LEADERSHIP",
  "GREEN_TEAM",
];

const roleByClassification: Record<ClassificationLevel, UserRole> = {
  GENERAL: UserRole.member,
  UNIT_CONFIDENTIAL: UserRole.tacdevron,
  SECRET: UserRole["160th"],
  TOP_SECRET: UserRole.intelligence,
  LEADERSHIP: UserRole.leadership,
  GREEN_TEAM: UserRole.greenTeam,
};

const fallbackPreviewByType: Record<string, string> = {
  PDF: "/document-previews/pdf.svg",
  DOC: "/document-previews/doc.svg",
  DOCX: "/document-previews/doc.svg",
  XLS: "/document-previews/sheet.svg",
  XLSX: "/document-previews/sheet.svg",
};

export function DocumentsClient({ roles }: { roles: string[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] =
    useState<string>("ALL");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "modifiedNewest" | "modifiedOldest"
  >("nameAsc");
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25);
  const [page, setPage] = useState(1);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDocs();
  }, []);

  const toggleUnit = (unit: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) {
        next.delete(unit);
      } else {
        next.add(unit);
      }
      return next;
    });
  };

  const isPrivileged =
    roles.includes(UserRole.superAdmin) ||
    roles.includes(UserRole.admin) ||
    roles.includes(UserRole.developer);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const doc of documents) {
      for (const tag of doc.tags ?? []) tags.add(tag);
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [documents]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === "ALL" || doc.unit === selectedUnit;
    const matchesClassification =
      selectedClassification === "ALL" ||
      doc.classification === selectedClassification;
    const matchesTag =
      selectedTag === "ALL" || (doc.tags ?? []).includes(selectedTag);
    return matchesSearch && matchesUnit && matchesClassification && matchesTag;
  });

  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments];
    if (sortBy === "nameAsc") docs.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "nameDesc")
      docs.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "modifiedNewest")
      docs.sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    if (sortBy === "modifiedOldest")
      docs.sort((a, b) => a.lastModified.localeCompare(b.lastModified));
    return docs;
  }, [filteredDocuments, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedUnit,
    selectedClassification,
    selectedTag,
    sortBy,
    pageSize,
  ]);

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / pageSize));
  const boundedPage = Math.min(page, totalPages);
  const pagedDocuments = sortedDocuments.slice(
    (boundedPage - 1) * pageSize,
    boundedPage * pageSize
  );

  const groupedByUnit = pagedDocuments.reduce<Record<string, DocumentItem[]>>(
    (acc, doc) => {
      if (!acc[doc.unit]) acc[doc.unit] = [];
      acc[doc.unit].push(doc);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Classification Notice */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/60 rounded-lg p-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Controlled Information — Need to Know Basis
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Access to documents is governed by your role, rank, and unit
            assignment. Unauthorized disclosure is strictly prohibited.
          </p>
        </div>
        {isPrivileged && (
          <Button
            onClick={() => router.push("/dashboard/documents/upload")}
            className="h-8 text-[10px] font-black uppercase tracking-widest"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <Card className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/50 rounded-lg">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name, description, or document number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 text-sm"
              />
            </div>

            {/* Unit Filter */}
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[140px]"
            >
              <option value="ALL">ALL UNITS</option>
              {allUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Classification Filter */}
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[140px]"
            >
              <option value="ALL">ALL ROLES</option>
              {classificationLevels.map((level) => (
                <option key={level} value={level}>
                  {classificationConfig[level].label}
                </option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[140px]"
            >
              <option value="ALL">ALL TAGS</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[150px]"
            >
              <option value="nameAsc">NAME A-Z</option>
              <option value="nameDesc">NAME Z-A</option>
              <option value="modifiedNewest">LATEST MODIFIED</option>
              <option value="modifiedOldest">OLDEST MODIFIED</option>
            </select>
            <select
              value={pageSize}
              onChange={(e) =>
                setPageSize(Number(e.target.value) as 25 | 50 | 100)
              }
              className="bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:border-accent/40 h-9 min-w-[120px]"
            >
              <option value={25}>25 / PAGE</option>
              <option value={50}>50 / PAGE</option>
              <option value={100}>100 / PAGE</option>
            </select>
          </div>

          {/* Active Filters */}
          {(selectedUnit !== "ALL" ||
            selectedClassification !== "ALL" ||
            selectedTag !== "ALL") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/60">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                ACTIVE FILTERS:
              </span>
              {selectedUnit !== "ALL" && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-accent/30 text-accent cursor-pointer hover:bg-accent/10 px-2 py-0"
                  onClick={() => setSelectedUnit("ALL")}
                >
                  {selectedUnit.toUpperCase()} ✕
                </Badge>
              )}
              {selectedClassification !== "ALL" && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono cursor-pointer hover:opacity-80 px-2 py-0 border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300"
                  onClick={() => setSelectedClassification("ALL")}
                >
                  {
                    classificationConfig[
                      selectedClassification as ClassificationLevel
                    ]?.label
                  }{" "}
                  ✕
                </Badge>
              )}
              {selectedTag !== "ALL" && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono cursor-pointer hover:opacity-80 px-2 py-0 border-zinc-300 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300"
                  onClick={() => setSelectedTag("ALL")}
                >
                  {selectedTag.toUpperCase()} ✕
                </Badge>
              )}
              <button
                onClick={() => {
                  setSelectedUnit("ALL");
                  setSelectedClassification("ALL");
                  setSelectedTag("ALL");
                }}
                className="text-[10px] text-zinc-500 hover:text-accent font-bold uppercase tracking-widest transition-colors ml-auto"
              >
                CLEAR ALL
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 border border-zinc-200 dark:border-zinc-800/70 rounded-lg bg-white dark:bg-zinc-900/50 p-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          SECTION CONTROLS
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] px-2.5 uppercase tracking-widest"
          onClick={() => setExpandedUnits(new Set(Object.keys(groupedByUnit)))}
        >
          Expand All
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] px-2.5 uppercase tracking-widest"
          onClick={() => setExpandedUnits(new Set())}
        >
          Collapse All
        </Button>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Showing {pagedDocuments.length} of {sortedDocuments.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {classificationLevels.map((level) => {
          const config = classificationConfig[level];
          const count = documents.filter(
            (d) => d.classification === level
          ).length;
          const isSelected = selectedClassification === level;
          return (
            <button
              key={level}
              onClick={() =>
                setSelectedClassification(isSelected ? "ALL" : level)
              }
              className={`bg-white dark:bg-zinc-900/60 border rounded-lg p-3 flex items-center gap-3 transition-all text-left ${
                isSelected
                  ? "border-zinc-400 dark:border-zinc-500 ring-1 ring-zinc-300 dark:ring-zinc-600"
                  : "border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-600/60"
              }`}
            >
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  {config.label}
                </p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Document Registry */}
      {Object.keys(groupedByUnit).length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-center py-12">
          <FileText className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
            NO DOCUMENTS ACQUIRED
          </p>
          <p className="text-[10px] text-zinc-600 mt-1 font-mono uppercase tracking-widest">
            Adjust your search criteria or classification node
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByUnit).map(([unit, docs]) => (
            <div
              key={unit}
              className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden"
            >
              {/* Unit Header */}
              <button
                onClick={() => toggleUnit(unit)}
                className="w-full flex items-center justify-between py-3 px-4 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                    {unit}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-widest font-mono">
                    [{docs.length} ENTRY]
                  </span>
                </div>
                {expandedUnits.has(unit) ? (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                )}
              </button>

              {/* Documents List */}
              {expandedUnits.has(unit) && (
                <div className="border-t border-zinc-200 dark:border-zinc-800/60">
                  {docs.map((doc) => {
                    const clr =
                      classificationConfig[
                        doc.classification as ClassificationLevel
                      ];
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col lg:flex-row lg:items-center gap-3 py-3 px-4 border-b border-zinc-200 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20 transition-colors group"
                      >
                        {/* Main Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-zinc-200 dark:border-zinc-700/70 bg-zinc-50 dark:bg-zinc-800/50">
                            <Image
                              src={
                                doc.previewPath ??
                                fallbackPreviewByType[doc.type] ??
                                "/document-previews/file.svg"
                              }
                              alt={`${doc.name} preview`}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <h4 className="text-[13px] font-black tracking-wide uppercase text-zinc-800 dark:text-zinc-200 transition-colors">
                                {doc.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-zinc-500 line-clamp-1 mb-1.5 font-mono">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 tracking-widest">
                                {doc.docNumber}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500">
                                <Clock className="h-3 w-3 text-zinc-600" />
                                {doc.lastModified}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {doc.size}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                By: {doc.author}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-black px-1.5 py-0 leading-tight uppercase tracking-widest ${
                                  doc.type === "PDF"
                                    ? "border-zinc-200 dark:border-zinc-700/80 text-zinc-400"
                                    : "border-zinc-200 dark:border-zinc-700/80 text-zinc-400"
                                }`}
                              >
                                {doc.type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Classification + Actions */}
                        <div className="flex items-center gap-3 shrink-0 lg:ml-auto">
                          <Badge
                            variant="outline"
                            className={`${clr.badgeClass} text-[9px] font-black tracking-widest flex items-center gap-1.5 px-2 py-0.5 rounded-lg`}
                          >
                            {clr.label}
                          </Badge>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] font-black uppercase tracking-widest px-3 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-accent hover:border-accent/50 bg-transparent"
                              onClick={async () => {
                                const res = await fetch(
                                  `/api/documents/${doc.id}/download`
                                );
                                const data = await res.json().catch(() => ({}));
                                if (res.ok && data?.url)
                                  window.open(
                                    data.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              DOWNLOAD
                            </Button>
                          </div>
                          {(doc.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {(doc.tags ?? []).map((tag) => (
                                <Badge
                                  key={`${doc.id}-${tag}`}
                                  variant="outline"
                                  className="text-[9px] font-mono border-zinc-300 dark:border-zinc-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-4 border-t border-zinc-200 dark:border-zinc-800/40">
        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
          All documents are the property of Naval Special Warfare Group One —
          Unauthorized reproduction or distribution is prohibited
        </p>
      </div>

      {sortedDocuments.length > 0 && (
        <div className="flex items-center justify-between gap-3 border border-zinc-200 dark:border-zinc-800/70 rounded-lg bg-white dark:bg-zinc-900/50 p-3">
          <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest">
            Page {boundedPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={boundedPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="h-7 text-[10px] uppercase tracking-widest"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={boundedPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-7 text-[10px] uppercase tracking-widest"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Lock,
  Eye,
  FolderOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  UserCog,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "next-auth/react";

// ─── Classification Levels ───
type ClearanceLevel = "UNCLASSIFIED" | "CONFIDENTIAL" | "SECRET" | "TOP_SECRET";

const classificationConfig: Record<
  ClearanceLevel,
  {
    label: string;
    color: string;
    borderColor: string;
    stripColor: string;
    icon: typeof Shield;
  }
> = {
  UNCLASSIFIED: {
    label: "UNCLASSIFIED",
    color: "text-zinc-400",
    borderColor: "border-zinc-600/50",
    stripColor: "bg-zinc-500",
    icon: Eye,
  },
  CONFIDENTIAL: {
    label: "CONFIDENTIAL",
    color: "text-accent",
    borderColor: "border-accent/30",
    stripColor: "bg-accent",
    icon: Shield,
  },
  SECRET: {
    label: "SECRET",
    color: "text-amber-500/80",
    borderColor: "border-amber-600/30",
    stripColor: "bg-amber-600/80",
    icon: Lock,
  },
  TOP_SECRET: {
    label: "TOP SECRET",
    color: "text-red-500/80",
    borderColor: "border-red-600/30",
    stripColor: "bg-red-600/80",
    icon: Lock,
  },
};

// ─── Document Data ───
interface Document {
  id: string;
  name: string;
  classification: ClearanceLevel;
  unit: string;
  type: string;
  size: string;
  lastModified: string;
  author: string;
  description: string;
  docNumber: string;
}

const fakeDocuments: Document[] = [
  {
    id: "1",
    name: "NSWG1 Standard Operating Procedures",
    classification: "UNCLASSIFIED",
    unit: "NSWG1 HQ",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2026-03-10",
    author: "CAPT Williams",
    description: "General SOPs for all NSWG1 personnel operations and protocols.",
    docNumber: "NSWG1-SOP-001",
  },
  {
    id: "2",
    name: "Personnel Conduct & Uniform Regulations",
    classification: "UNCLASSIFIED",
    unit: "NSWG1 HQ",
    type: "PDF",
    size: "1.1 MB",
    lastModified: "2026-02-28",
    author: "LCDR Martinez",
    description: "Standards of conduct and uniform requirements for all assigned personnel.",
    docNumber: "NSWG1-REG-004",
  },
  {
    id: "3",
    name: "COMSEC Protocol — Secure Communications",
    classification: "CONFIDENTIAL",
    unit: "NSWG1 HQ",
    type: "PDF",
    size: "890 KB",
    lastModified: "2026-03-05",
    author: "LT Davis",
    description: "Communications security directives for encrypted channels.",
    docNumber: "NSWG1-COMSEC-012",
  },
  {
    id: "4",
    name: "OPSEC Annual Briefing Package",
    classification: "SECRET",
    unit: "NSWG1 HQ",
    type: "DOCX",
    size: "3.2 MB",
    lastModified: "2026-01-15",
    author: "CDR Thompson",
    description: "Annual operational security briefing materials — distribution limited.",
    docNumber: "NSWG1-OPSEC-026",
  },
  {
    id: "5",
    name: "Joint Operations Directive — OPLAN TRIDENT FURY",
    classification: "TOP_SECRET",
    unit: "NSWG1 HQ",
    type: "PDF",
    size: "5.7 MB",
    lastModified: "2026-03-01",
    author: "RADM Johnson",
    description: "Strategic joint operations planning — need-to-know access only.",
    docNumber: "NSWG1-OPLAN-TS-003",
  },
  {
    id: "6",
    name: "ST2 Operator Training & Readiness Manual",
    classification: "UNCLASSIFIED",
    unit: "SEAL Team 2",
    type: "PDF",
    size: "4.5 MB",
    lastModified: "2026-03-12",
    author: "LCDR Brooks",
    description: "Comprehensive training manual covering all phases of operator readiness.",
    docNumber: "ST2-TRG-008",
  },
  {
    id: "7",
    name: "Platoon Deployment ORBAT — Q2 FY26",
    classification: "CONFIDENTIAL",
    unit: "SEAL Team 2",
    type: "XLSX",
    size: "340 KB",
    lastModified: "2026-03-08",
    author: "LT Garcia",
    description: "Order of battle and deployment rotation schedule for Q2.",
    docNumber: "ST2-ORBAT-Q2-26",
  },
  {
    id: "8",
    name: "AAR — Operation TRIDENT SPEAR",
    classification: "SECRET",
    unit: "SEAL Team 2",
    type: "PDF",
    size: "2.1 MB",
    lastModified: "2026-02-20",
    author: "CDR Hayes",
    description: "After action report with lessons learned — limited distribution.",
    docNumber: "ST2-AAR-041",
  },
  {
    id: "9",
    name: "TACDEVRON 2 Equipment Manifest & Logistics",
    classification: "UNCLASSIFIED",
    unit: "TACDEVRON 2",
    type: "XLSX",
    size: "780 KB",
    lastModified: "2026-03-14",
    author: "LT Park",
    description: "Current equipment inventory, logistics pipeline, and maintenance status.",
    docNumber: "TDR2-LOG-019",
  },
  {
    id: "10",
    name: "Experimental CQB Doctrine Evaluation",
    classification: "SECRET",
    unit: "TACDEVRON 2",
    type: "PDF",
    size: "1.9 MB",
    lastModified: "2026-03-03",
    author: "LCDR Chen",
    description: "Classified evaluation of close-quarters battle doctrine modifications.",
    docNumber: "TDR2-TAC-007",
  },
  {
    id: "11",
    name: "Next-Gen Weapons Platform Integration Brief",
    classification: "TOP_SECRET",
    unit: "TACDEVRON 2",
    type: "PDF",
    size: "4.3 MB",
    lastModified: "2026-02-25",
    author: "CDR Nakamura",
    description: "Advanced weapons system integration and testing results.",
    docNumber: "TDR2-WPNS-TS-002",
  },
  {
    id: "12",
    name: "TF160 Rotary-Wing Flight Operations Handbook",
    classification: "UNCLASSIFIED",
    unit: "Task Force 160th",
    type: "PDF",
    size: "6.2 MB",
    lastModified: "2026-03-11",
    author: "MAJ Collins",
    description: "Standard flight operations, safety procedures, and emergency protocols.",
    docNumber: "TF160-FLT-001",
  },
  {
    id: "13",
    name: "NVG Operations & Night Insertion Protocols",
    classification: "CONFIDENTIAL",
    unit: "Task Force 160th",
    type: "PDF",
    size: "1.5 MB",
    lastModified: "2026-03-07",
    author: "CW4 Rodriguez",
    description: "Night vision goggle operations and nighttime insertion/extraction procedures.",
    docNumber: "TF160-NVG-014",
  },
  {
    id: "14",
    name: "INFIL/EXFIL Route Analysis — AO SERPENT",
    classification: "SECRET",
    unit: "Task Force 160th",
    type: "PDF",
    size: "3.8 MB",
    lastModified: "2026-02-18",
    author: "LTC Adams",
    description: "Classified route analysis for infiltration and exfiltration in designated AO.",
    docNumber: "TF160-RTE-009",
  },
];

const allUnits = ["NSWG1 HQ", "SEAL Team 2", "TACDEVRON 2", "Task Force 160th"];
const classificationLevels: ClearanceLevel[] = ["UNCLASSIFIED", "CONFIDENTIAL", "SECRET", "TOP_SECRET"];

type RoleView = "superAdmin" | "admin" | "member";

export function DocumentsClient() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(allUnits));
  const [roleView, setRoleView] = useState<RoleView>("superAdmin");

  const isAdminOrSuper = ["admin", "superAdmin"].some((r) =>
    session?.user?.roles?.includes(r)
  );

  const toggleUnit = (unit: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(unit) ? next.delete(unit) : next.add(unit);
      return next;
    });
  };

  // Role-based filtering (simulated)
  let visibleDocuments = fakeDocuments;
  if (roleView === "admin") {
    visibleDocuments = visibleDocuments.filter(
      (d) => d.unit === "SEAL Team 2" || d.unit === "NSWG1 HQ"
    );
  } else if (roleView === "member") {
    visibleDocuments = visibleDocuments.filter(
      (d) => d.classification === "UNCLASSIFIED"
    );
  }

  const filteredDocuments = visibleDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === "ALL" || doc.unit === selectedUnit;
    const matchesClassification =
      selectedClassification === "ALL" || doc.classification === selectedClassification;
    return matchesSearch && matchesUnit && matchesClassification;
  });

  // Group by unit
  const groupedByUnit = filteredDocuments.reduce<Record<string, Document[]>>(
    (acc, doc) => {
      if (!acc[doc.unit]) acc[doc.unit] = [];
      acc[doc.unit].push(doc);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Classification Notice */}
      <div className="bg-zinc-900/80 border border-zinc-700/60 rounded-sm p-4 flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-bold text-zinc-100 uppercase tracking-wide">
            Controlled Information — Need to Know Basis
          </p>
          <p className="text-base text-zinc-400 mt-1">
            Access to classified materials is governed by your clearance level and unit assignment. 
            Unauthorized disclosure is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Admin Role View Toggle */}
      {isAdminOrSuper && (
        <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm">
          <CardHeader className="pb-3 p-4 border-b border-zinc-800/80">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100 uppercase tracking-wider">
              <UserCog className="h-4 w-4 text-accent" />
              Role View Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap">
              {(
                [
                  { key: "superAdmin" as RoleView, label: "Super Admin — All Units" },
                  { key: "admin" as RoleView, label: "Admin — Unit Restricted" },
                  { key: "member" as RoleView, label: "Member — Standard Access" },
                ] as const
              ).map((view) => (
                <button
                  key={view.key}
                  onClick={() => setRoleView(view.key)}
                  className={`px-4 py-2 text-sm rounded-sm border transition-all ${
                    roleView === view.key
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-accent hover:border-accent/30"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
            {roleView !== "superAdmin" && (
              <p className="text-sm text-zinc-500 mt-3">
                {roleView === "admin"
                  ? "Viewing as Admin — Restricted to your assigned unit and HQ documents only."
                  : "Viewing as Member — Only UNCLASSIFIED documents are visible."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="bg-zinc-900/60 border-zinc-700/50 rounded-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name, description, or document number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/60 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 text-sm"
              />
            </div>

            {/* Unit Filter */}
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm rounded-sm px-4 py-2 focus:border-accent/50 focus:outline-none cursor-pointer min-w-[170px]"
            >
              <option value="ALL">All Units</option>
              {allUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>

            {/* Classification Filter */}
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm rounded-sm px-4 py-2 focus:border-accent/50 focus:outline-none cursor-pointer min-w-[170px]"
            >
              <option value="ALL">All Classifications</option>
              {classificationLevels.map((level) => (
                <option key={level} value={level}>
                  {classificationConfig[level].label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(selectedUnit !== "ALL" || selectedClassification !== "ALL") && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/60">
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Active:
              </span>
              {selectedUnit !== "ALL" && (
                <Badge
                  variant="outline"
                  className="text-xs border-accent/30 text-accent cursor-pointer hover:bg-accent/10"
                  onClick={() => setSelectedUnit("ALL")}
                >
                  {selectedUnit} ✕
                </Badge>
              )}
              {selectedClassification !== "ALL" && (
                <Badge
                  variant="outline"
                  className={`text-xs cursor-pointer hover:opacity-80 ${classificationConfig[selectedClassification as ClearanceLevel]?.borderColor} ${classificationConfig[selectedClassification as ClearanceLevel]?.color}`}
                  onClick={() => setSelectedClassification("ALL")}
                >
                  {classificationConfig[selectedClassification as ClearanceLevel]?.label} ✕
                </Badge>
              )}
              <button
                onClick={() => {
                  setSelectedUnit("ALL");
                  setSelectedClassification("ALL");
                }}
                className="text-xs text-zinc-500 hover:text-accent transition-colors ml-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classification Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {classificationLevels.map((level) => {
          const config = classificationConfig[level];
          const count = visibleDocuments.filter((d) => d.classification === level).length;
          const CIcon = config.icon;
          const isSelected = selectedClassification === level;
          return (
            <button
              key={level}
              onClick={() =>
                setSelectedClassification(isSelected ? "ALL" : level)
              }
              className={`bg-zinc-900/60 border rounded-sm p-4 flex items-center gap-4 transition-all text-left ${
                isSelected
                  ? `${config.borderColor} ring-1 ring-current`
                  : "border-zinc-700/50 hover:border-zinc-600/60"
              }`}
            >
              <CIcon className={`h-5 w-5 ${config.color} shrink-0`} />
              <div>
                <p className={`text-sm tracking-wider font-bold ${config.color}`}>
                  {config.label}
                </p>
                <p className="text-xl font-bold text-zinc-100 mt-0.5">{count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Document Registry */}
      {Object.keys(groupedByUnit).length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-sm text-center py-20">
          <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-400 text-base">No documents match current filters</p>
          <p className="text-sm text-zinc-600 mt-1">
            Adjust your search criteria or classification level
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByUnit).map(([unit, docs]) => (
            <div
              key={unit}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-sm overflow-hidden"
            >
              {/* Unit Header */}
              <button
                onClick={() => toggleUnit(unit)}
                className="w-full flex items-center justify-between p-5 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-accent" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-zinc-100">
                    {unit}
                  </h3>
                  <span className="text-sm font-medium text-zinc-400 ml-2">
                    {docs.length} document{docs.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {expandedUnits.has(unit) ? (
                  <ChevronDown className="h-5 w-5 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-zinc-500" />
                )}
              </button>

              {/* Documents List */}
              {expandedUnits.has(unit) && (
                <div className="border-t border-zinc-800/60">
                  {docs.map((doc) => {
                    const clr = classificationConfig[doc.classification];
                    const CIcon = clr.icon;
                    return (
                      <div
                        key={doc.id}
                        className="relative flex flex-col lg:flex-row lg:items-center gap-4 p-5 border-b border-zinc-800/40 last:border-0 hover:bg-accent/[0.03] transition-colors group"
                      >
                        {/* Left classification strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${clr.stripColor}`} />

                        {/* Document Icon & Main Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0 pl-3">
                          <div className="p-3 rounded-sm bg-zinc-800/60 border border-zinc-700/40 shrink-0">
                            <FileText className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-1.5">
                              <h4 className="text-base font-semibold text-zinc-100 group-hover:text-accent transition-colors">
                                {doc.name}
                              </h4>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-1 mb-2">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-sm font-bold text-accent/80">
                                {doc.docNumber}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                {doc.lastModified}
                              </span>
                              <span className="text-sm text-zinc-400">{doc.size}</span>
                              <span className="text-sm text-zinc-400">{doc.author}</span>
                              <Badge
                                variant="outline"
                                className={`text-xs font-bold px-3 py-1 ${
                                  doc.type === "PDF"
                                    ? "border-zinc-600/50 text-zinc-400"
                                    : doc.type === "XLSX"
                                    ? "border-zinc-600/50 text-zinc-400"
                                    : "border-zinc-600/50 text-zinc-400"
                                }`}
                              >
                                {doc.type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Classification + Actions */}
                        <div className="flex items-center gap-4 shrink-0 lg:ml-auto pl-3 lg:pl-0">
                          <Badge
                            variant="outline"
                            className={`${clr.borderColor} ${clr.color} text-xs font-bold flex items-center gap-1.5 px-3 py-1`}
                          >
                            <CIcon className="h-3.5 w-3.5" />
                            {clr.label}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-sm border-zinc-700 text-zinc-300 hover:text-accent hover:border-accent/50 bg-transparent"
                            >
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-sm border-zinc-700 text-zinc-300 hover:text-accent hover:border-accent/50 bg-transparent"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </Button>
                          </div>
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
      <div className="text-center py-4 border-t border-zinc-800/40">
        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
          All documents are the property of Naval Special Warfare Group One — Unauthorized reproduction or distribution is prohibited
        </p>
      </div>
    </div>
  );
}

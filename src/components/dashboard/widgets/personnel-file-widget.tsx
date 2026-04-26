"use client";

import { AwardDetailModal } from "@/components/perscom/award-detail-modal";
import { useState } from "react";
import Image from "next/image";
import { sanitizeHtmlClient } from "@/lib/sanitize/sanitizeHtmlClient";

interface PersonnelFileWidgetProps {
  awardRecords: any[];
  awardImages: {
    id: number;
    imageUrl: string | null;
    name: string;
    order: number;
  }[];
  qualificationRecords: any[];
  qualificationData: { id: number; name: string; received: string }[];
  rankHistory: {
    id: number;
    recordId: number;
    imageUrl: string | null;
    name: string;
    date: string;
    text: string;
  }[];
  assignmentHistory: {
    id: number;
    unitId: number;
    positionId: number;
    unitName: string;
    positionName: string;
    date: string;
    text: string;
    type: string;
  }[];
  combatHistory: {
    id: number;
    date: string;
    text: string;
    author: number;
    documentParsed: string | null;
  }[];
}

// Keywords that identify insignia / badges (worn above ribbons)
const INSIGNIA_KEYWORDS = [
  "trident",
  "warfare",
  "insignia",
  "badge",
  "tab",
  "wings",
  "parachutist",
  "diver",
  "seal",
  "budweiser",
  "pin",
  "device",
];

function isInsignia(name: string): boolean {
  const lower = name.toLowerCase();
  return INSIGNIA_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Build ribbon rows per US Navy regulation (MyNavyHR):
 *  - Rows of 3
 *  - If not a multiple of 3, the TOP row has the remainder (1 or 2)
 *  - Top row is centered over the full rows below
 *  - No spaces between rows
 */
function buildNavyRibbonRows(records: any[]): any[][] {
  const remainder = records.length % 3;
  const rows: any[][] = [];

  if (remainder > 0) {
    rows.push(records.slice(0, remainder));
  }

  for (let i = remainder; i < records.length; i += 3) {
    rows.push(records.slice(i, i + 3));
  }

  return rows;
}

export function PersonnelFileWidget({
  awardRecords,
  awardImages,
  qualificationRecords,
  qualificationData,
  rankHistory,
  assignmentHistory,
  combatHistory,
}: PersonnelFileWidgetProps) {
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  const openAwardModal = (record: any) => {
    const awardImage = awardImages.find((img) => img.id === record.award_id);
    setSelectedAward({
      ...record,
      imageUrl: awardImage?.imageUrl || "/placeholder.svg",
      name: awardImage?.name || "Unknown Award",
      sanitizedText: sanitizeHtmlClient(record.text),
      formattedDate: new Date(record.created_at).toLocaleDateString(),
    });
    setIsAwardModalOpen(true);
  };

  // Sort all award records by precedence order (lower = higher precedence)
  const sortedAwardRecords = [...awardRecords].sort((a, b) => {
    const orderA =
      awardImages.find((img) => img.id === a.award_id)?.order ?? 999;
    const orderB =
      awardImages.find((img) => img.id === b.award_id)?.order ?? 999;
    return orderA - orderB;
  });

  // Separate into insignia/badges and ribbons
  const insigniaRecords = sortedAwardRecords.filter((record) => {
    const img = awardImages.find((a) => a.id === record.award_id);
    return img ? isInsignia(img.name) : false;
  });

  const ribbonRecords = sortedAwardRecords.filter((record) => {
    const img = awardImages.find((a) => a.id === record.award_id);
    return img ? !isInsignia(img.name) : true;
  });

  // Build rows per Navy regulation (rows of 3, remainder on top centered)
  const ribbonRows = buildNavyRibbonRows(ribbonRecords);

  return (
    <div className="w-full">
      {awardRecords.length > 0 ? (
        <div className="w-full">
          {/* ── Award Rack Plaque — fills the widget card ── */}
          <div
            className="w-full rounded-[3px] p-[3px]"
            style={{
              background:
                "linear-gradient(145deg, #6B5B3E 0%, #8B7355 15%, #C4A265 30%, #D4AF37 50%, #C4A265 70%, #8B7355 85%, #6B5B3E 100%)",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.7), 0 1px 4px rgba(212, 175, 55, 0.2)",
            }}
          >
            {/* Dark felt surface */}
            <div
              className="w-full rounded-[2px] px-4 py-5 flex flex-col items-center"
              style={{
                background:
                  "linear-gradient(180deg, #111 0%, #0a0a0a 50%, #050505 100%)",
                boxShadow: "inset 0 2px 12px rgba(0, 0, 0, 0.95)",
              }}
            >
              {/* ── Insignia / Badges (above ribbons, centered) ── */}
              {insigniaRecords.length > 0 && (
                <div className="flex justify-center gap-4 mb-3">
                  {insigniaRecords.map((record, i) => {
                    const img = awardImages.find(
                      (a) => a.id === record.award_id
                    );
                    return (
                      <button
                        key={`insignia-${i}`}
                        onClick={() => openAwardModal(record)}
                        className="group relative h-[64px] w-[64px] overflow-hidden focus:outline-none focus:ring-1 focus:ring-accent/60 transition-all hover:scale-110 hover:z-10 bg-transparent cursor-pointer block"
                        title={img?.name || "Insignia"}
                      >
                        <Image
                          src={img?.imageUrl || "/placeholder.svg"}
                          alt={img?.name || "Insignia"}
                          fill
                          className="object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
                        />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Ribbon Rows (Navy reg: 3 per row, remainder centered on top) ── */}
              <div className="flex flex-col items-center gap-0">
                {ribbonRows.map((row, rowIdx) => (
                  <div key={`row-${rowIdx}`} className="flex justify-center">
                    {row.map((record, i) => {
                      const img = awardImages.find(
                        (a) => a.id === record.award_id
                      );
                      return (
                        <button
                          key={`ribbon-${rowIdx}-${i}`}
                          onClick={() => openAwardModal(record)}
                          className="group relative overflow-hidden focus:outline-none transition-all hover:brightness-125 hover:z-10 cursor-pointer block shrink-0"
                          title={img?.name || "Award Ribbon"}
                          style={{
                            height: "36px",
                            width: "108px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          <Image
                            src={img?.imageUrl || "/placeholder.svg"}
                            alt={img?.name || "Award Ribbon"}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors pointer-events-none" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState text="No awards recorded" />
      )}

      <AwardDetailModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        award={selectedAward}
      />
    </div>
  );
}

// ── Shared sub-components ──

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center p-10 border border-zinc-200 dark:border-zinc-700/50 border-dashed rounded-lg bg-zinc-50 dark:bg-black/20">
      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}

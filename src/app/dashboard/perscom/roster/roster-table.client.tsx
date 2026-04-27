"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PerscomUserResponse, Rank } from "@/types/api/perscomApi";
import Image from "next/image";
import { ChevronRight, Users } from "lucide-react";

interface Personnel {
  id: number;
  name: string;
  rank: string;
  rankImage?: string;
  position: string;
  status: string;
}

interface Section {
  id: string;
  name: string;
  personnel: Personnel[];
}

interface MainUnit {
  id: string;
  name: string;
  sections: Section[];
}

interface RosterTableProps {
  members: PerscomUserResponse[];
  ranks: Rank[];
}

export const RosterTable = ({ members, ranks }: RosterTableProps) => {
  const [selectedMainUnit, setSelectedMainUnit] = useState<string>("");

  const mainUnits: MainUnit[] = useMemo<MainUnit[]>(() => {
    if (!members || members.length === 0) return [];

    const dynamicUnits: Map<string, MainUnit> = new Map<string, MainUnit>();

    members.forEach((member: PerscomUserResponse) => {
      const statusName: string = member.status?.name?.toLowerCase() || "";

      const isLeave: boolean = statusName.includes("leave");
      const isDischarged: boolean = statusName.includes("discharge") || statusName.includes("inactive");

      if (!member.unit?.name && !isLeave && !isDischarged) return;

      let mainUnitName: string = member.unit?.name || "";
      let sectionName: string;

      if (isLeave) {
        mainUnitName = "Leave of Absence";
        sectionName = member.status?.name || "Leave of Absence";
      } else if (isDischarged) {
        mainUnitName = "Discharge";
        sectionName = member.status?.name || "Previous Members";
      } else if (mainUnitName.includes(",")) {
        const parts: string[] = mainUnitName.split(",");
        const baseTab: string = parts[0].trim();
        const restOfName: string = parts.slice(1).join(",").trim();

        const troopMatch: RegExpMatchArray | null = restOfName.match(/(\d+(?:st|nd|rd|th)\s+Troop)/i);

        if (troopMatch) {
          mainUnitName = `${baseTab} - ${troopMatch[1]}`;
          sectionName = restOfName.replace(troopMatch[1], "").trim();

          if (!sectionName) sectionName = mainUnitName;
        } else {
          mainUnitName = baseTab;
          sectionName = restOfName;
        }
      } else {
        sectionName = mainUnitName.trim();
      }

      const mainUnitId: string = mainUnitName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const sectionId: string = `${mainUnitId}-${sectionName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

      if (!dynamicUnits.has(mainUnitId)) {
        dynamicUnits.set(mainUnitId, {
          id: mainUnitId,
          name: mainUnitName,
          sections: [],
        });
      }

      const mainUnit: MainUnit = dynamicUnits.get(mainUnitId)!;

      let section: Section | undefined = mainUnit.sections.find((s: Section) => s.id === sectionId);
      if (!section) {
        section = { id: sectionId, name: sectionName, personnel: [] };
        mainUnit.sections.push(section);
      }

      section.personnel.push({
        id: member.id,
        name: member.name,
        rank: member.rank?.name || "Unknown",
        rankImage: member.rank?.id
          ? ranks.find((r: Rank) => r.id === member.rank?.id)?.image?.image_url ||
          `/ranks/${member.rank?.abbreviation}.svg`
          : undefined,
        position: member.position?.name || "Unknown",
        status: member.status?.name || "Unknown",
      });
    });

    const getUnitWeight = (name: string): number => {
      const lower: string = name.toLowerCase();
      if (lower.includes("tacdevron")) return 1;
      if (lower.includes("160th")) return 2;
      if (lower.includes("discharge")) return 6;
      if (lower.includes("leave")) return 5;
      if (lower.includes("green team") || lower.includes("green platoon")) return 4;
      return 3;
    };

    const compiledUnits: MainUnit[] = Array.from(dynamicUnits.values()).map((unit: MainUnit) => {
      unit.sections.sort((a: Section, b: Section): number => {
        if (unit.id === "discharge") {
          const getDischargeSectionWeight = (secName: string): number => {
            const lower: string = secName.toLowerCase();
            if (lower.includes("honorable") && !lower.includes("dishonorable")) return 1;
            if (lower.includes("dishonorable")) return 2;
            if (lower === "discharge") return 4;
            return 5;
          };
          const weightA: number = getDischargeSectionWeight(a.name);
          const weightB: number = getDischargeSectionWeight(b.name);
          if (weightA !== weightB) return weightA - weightB;
        }
        else {
          if (a.name === unit.name && b.name !== unit.name) return -1;
          if (a.name !== unit.name && b.name === unit.name) return 1;
        }

        const aCmd: boolean = a.name.toLowerCase().includes("command") || a.name.toLowerCase().includes("hq");
        const bCmd: boolean = b.name.toLowerCase().includes("command") || b.name.toLowerCase().includes("hq");

        if (aCmd && !bCmd) return -1;
        if (!aCmd && bCmd) return 1;

        return a.name.localeCompare(b.name);
      });
      return unit;
    });

    compiledUnits.sort((a: MainUnit, b: MainUnit): number => {
      const weightA: number = getUnitWeight(a.name);
      const weightB: number = getUnitWeight(b.name);

      if (weightA !== weightB) return weightA - weightB;
      return a.name.localeCompare(b.name);
    });

    return compiledUnits;
  }, [members, ranks]);

  useEffect(() => {
    if (mainUnits.length > 0 && !mainUnits.some((u: MainUnit) => u.id === selectedMainUnit)) {
      setSelectedMainUnit(mainUnits[0].id);
    }
  }, [mainUnits, selectedMainUnit]);

  const currentMainUnit: MainUnit | undefined = mainUnits.find((unit: MainUnit) => unit.id === selectedMainUnit);

  const getStatusColor = (status: string): string => {
    const lower: string = status.toLowerCase();
    if (lower === "active duty")
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (lower.includes("leave"))
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (lower.includes("discharged") || lower.includes("inactive"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
  };

  if (!currentMainUnit) return null;

  return (
    <>
      <div className="flex flex-wrap gap-1 mb-6 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-1">
        {mainUnits.map((unit: MainUnit) => (
          <button
            key={unit.id}
            onClick={() => setSelectedMainUnit(unit.id)}
            className={`flex-1 min-w-[140px] px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-all rounded-lg cursor-pointer ${
              selectedMainUnit === unit.id
                ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-b-2 border-b-accent/80 shadow-inner"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 border-b-2 border-b-transparent"
            }`}
          >
            {unit.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {currentMainUnit.sections.map((section: Section) => (
          <div
            key={section.id}
            className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/60 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-700/40">
              <Users className="h-4 w-4 text-accent shrink-0" />
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-800 dark:text-zinc-200 font-semibold">
                {section.name}
              </h3>
              <span className="ml-auto text-[10px] font-mono text-zinc-500 tracking-widest">
                {section.personnel.length} PERSONNEL
              </span>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {section.personnel.map((person: Personnel) => (
                <Link
                  key={person.id}
                  href={`/dashboard/perscom/user/${person.id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:border-l-2 hover:border-l-accent/60 border-l-2 border-l-transparent"
                >
                  <div className="relative h-8 w-8 shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-black/30 rounded-lg border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
                    <Image
                      src={person.rankImage || "/placeholder.svg"}
                      alt={person.rank}
                      fill
                      className="object-contain p-0.5 drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white truncate">
                        {person.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">
                      {person.rank}
                    </span>
                  </div>

                  <div className="hidden md:block text-right min-w-[160px]">
                    <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
                      {person.position}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border ${getStatusColor(
                      person.status
                    )}`}
                  >
                    {person.status}
                  </span>

                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-accent transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
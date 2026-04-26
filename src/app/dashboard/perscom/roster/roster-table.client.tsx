"use client";

import { useEffect, useState } from "react";
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
  id: number;
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
  const [selectedMainUnit, setSelectedMainUnit] = useState<string>("tacdevron");
  const [mainUnits, setMainUnits] = useState<MainUnit[]>([]);

  useEffect(() => {
    const tacdevronUnit: MainUnit = {
      id: "tacdevron",
      name: "Tacdevron 2 A Troop",
      sections: [],
    };

    const soarUnit: MainUnit = {
      id: "160th",
      name: "1st Battalion 160th SOAR",
      sections: [],
    };

    const dischargedUnit: MainUnit = {
      id: "discharged",
      name: "Personnel On Leave",
      sections: [],
    };
    const supportUnit: MainUnit = {
      id: "support",
      name: "Joint Support Units",
      sections: [],
    };

    const tacdevronSections = new Map<number, Section>();
    const soarSections = new Map<number, Section>();
    const dischargedSections = new Map<number, Section>();
    const supportSections = new Map<number, Section>();

    members?.forEach((member) => {
      if (!member.unit?.id || !member.unit?.name) return;

      const unitId = member.unit.id;
      const unitName = member.unit.name;

      let targetSectionsMap: Map<number, Section>;

      if (
        unitName.toLowerCase().includes("tacdevron") ||
        unitName.toLowerCase().includes("green team")
      ) {
        targetSectionsMap = tacdevronSections;
      } else if (unitName.toLowerCase().includes("160th")) {
        targetSectionsMap = soarSections;
      } else if (
        unitName.toLowerCase().includes("discharge") &&
        member.status?.name.toLowerCase() === "leave of absence"
      ) {
        targetSectionsMap = dischargedSections;
      } else {
        targetSectionsMap = supportSections;
      }

      if (!targetSectionsMap.has(unitId)) {
        targetSectionsMap.set(unitId, {
          id: unitId,
          name: unitName,
          personnel: [],
        });
      }

      const section = targetSectionsMap.get(unitId)!;

      section.personnel.push({
        id: member.id,
        name: member.name,
        rank: member.rank?.name || "Unknown",
        rankImage: member.rank?.id
          ? ranks.find((r) => r.id === member.rank?.id)?.image?.image_url ||
            `/ranks/${member.rank.abbreviation}.svg`
          : undefined,
        position: member.position?.name || "Unknown",
        status: member.status?.name || "Unknown",
      });
    });

    const sortSections = (sections: Section[]): Section[] => {
      return sections.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aIsGreenTeam = aName.includes("green team");
        const bIsGreenTeam = bName.includes("green team");

        const aHasCommand = aName.includes("command");
        const bHasCommand = bName.includes("command");

        const aHasEnable = aName.includes("enable");
        const bHasEnable = bName.includes("enable");

        if (aHasCommand && !bHasCommand) return -1;
        if (!aHasCommand && bHasCommand) return 1;

        if (aHasEnable && !bHasEnable) return -1;
        if (!aHasEnable && bHasEnable) return 1;

        if (aIsGreenTeam && !bIsGreenTeam) return 1;
        if (!aIsGreenTeam && bIsGreenTeam) return -1;

        return aName.localeCompare(bName);
      });
    };

    tacdevronUnit.sections = sortSections(
      Array.from(tacdevronSections.values())
    );
    soarUnit.sections = sortSections(Array.from(soarSections.values()));
    dischargedUnit.sections = sortSections(
      Array.from(dischargedSections.values())
    );
    supportUnit.sections = sortSections(Array.from(supportSections.values()));

    const unitsWithPersonnel: MainUnit[] = [];
    if (tacdevronUnit.sections.length > 0)
      unitsWithPersonnel.push(tacdevronUnit);
    if (soarUnit.sections.length > 0) unitsWithPersonnel.push(soarUnit);
    if (dischargedUnit.sections.length > 0)
      unitsWithPersonnel.push(dischargedUnit);
    if (supportUnit.sections.length > 0) unitsWithPersonnel.push(supportUnit);

    setMainUnits(unitsWithPersonnel);

    if (
      unitsWithPersonnel.length > 0 &&
      !unitsWithPersonnel.some((unit) => unit.id === selectedMainUnit)
    ) {
      setSelectedMainUnit(unitsWithPersonnel[0].id);
    }
  }, [members, ranks, selectedMainUnit]);

  const currentMainUnit = mainUnits.find(
    (unit) => unit.id === selectedMainUnit
  );

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "active duty")
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (lower.includes("leave"))
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (lower.includes("discharged") || lower.includes("inactive"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
  };

  return (
    <>
      {/* Unit Selection Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-1">
        {mainUnits.map((unit) => (
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

      {/* Sections */}
      <div className="space-y-6">
        {currentMainUnit?.sections.map((section) => (
          <div
            key={section.id}
            className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/60 rounded-lg overflow-hidden shadow-lg"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-700/40">
              <Users className="h-4 w-4 text-accent shrink-0" />
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-800 dark:text-zinc-200 font-semibold">
                {section.name}
              </h3>
              <span className="ml-auto text-[10px] font-mono text-zinc-500 tracking-widest">
                {section.personnel.length} PERSONNEL
              </span>
            </div>

            {/* Personnel List */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {section.personnel.map((person) => (
                <Link
                  key={person.id}
                  href={`/dashboard/perscom/user/${person.id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:border-l-2 hover:border-l-accent/60 border-l-2 border-l-transparent"
                >
                  {/* Rank Insignia */}
                  <div className="relative h-8 w-8 shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-black/30 rounded-lg border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
                    <Image
                      src={person.rankImage || "/placeholder.svg"}
                      alt={person.rank}
                      fill
                      className="object-contain p-0.5 drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                    />
                  </div>

                  {/* Name & Rank */}
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

                  {/* Position */}
                  <div className="hidden md:block text-right min-w-[160px]">
                    <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
                      {person.position}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border ${getStatusColor(person.status)}`}
                  >
                    {person.status}
                  </span>

                  {/* Arrow */}
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

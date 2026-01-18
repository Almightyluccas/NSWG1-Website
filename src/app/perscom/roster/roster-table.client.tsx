"use client"

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PerscomUserResponse, Rank } from "@/types/api/perscomApi";
import Image from "next/image";

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
  members: PerscomUserResponse[]
  ranks: Rank[]
}

//TODO: tests if comparison if faster in backend or frontend
export const RosterTable = ({ members, ranks }: RosterTableProps) => {
  const [selectedMainUnit, setSelectedMainUnit] = useState<string>("tacdevron");
  const [mainUnits, setMainUnits] = useState<MainUnit[]>([]);

  useEffect(() => {
    const tacdevronUnit: MainUnit = {
      id: "tacdevron",
      name: "Tacdevron 2 A Troop",
      sections: []
    };

    const soarUnit: MainUnit = {
      id: "160th",
      name: "1st Battalion 160th SOAR",
      sections: []
    };

    const dischargedUnit: MainUnit = {
      id: "discharged",
      name: "Personnel On Leave",
      sections: []
    };

    const tacdevronSections = new Map<number, Section>();
    const soarSections = new Map<number, Section>();
    const dischargedSections = new Map<number, Section>();

    members?.forEach(member => {
      if (!member.unit?.id || !member.unit?.name) return;

      const unitId = member.unit.id;
      const unitName = member.unit.name;

      let targetSectionsMap: Map<number, Section>;
      // TODO: check types to improve the if statements especially memebr.status.name .. .shoudl be equal to perscom.user.status.leave somethign like this

      if (unitName.toLowerCase().includes("tacdevron") || unitName.toLowerCase().includes('green team')) {
        targetSectionsMap = tacdevronSections;
      } else if (unitName.toLowerCase().includes("160th")) {
        targetSectionsMap = soarSections;
      } else if (unitName.toLowerCase().includes("discharge") && member.status?.name.toLowerCase() === "leave of absence") {
        console.log(member)
        targetSectionsMap = dischargedSections;
      } else {
        console.log(`Skipping member ${member.name} with unit ${unitName} - does not belong to Tacdevron or 160th`)
        return;
      }

      if (!targetSectionsMap.has(unitId)) {
        targetSectionsMap.set(unitId, {
          id: unitId,
          name: unitName,
          personnel: []
        });
      }

      const section = targetSectionsMap.get(unitId)!;

      section.personnel.push({
        id: member.id,
        name: member.name,
        rank: member.rank?.name || "Unknown",
        rankImage: member.rank?.id
          ? ranks.find(r => r.id === member.rank?.id)?.image?.image_url || `/ranks/${member.rank.abbreviation}.svg`
          : undefined,
        position: member.position?.name || "Unknown",
        status: member.status?.name || "Unknown"
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

    tacdevronUnit.sections = sortSections(Array.from(tacdevronSections.values()));
    soarUnit.sections = sortSections(Array.from(soarSections.values()));
    dischargedUnit.sections = sortSections(Array.from(dischargedSections.values()));

    const unitsWithPersonnel: MainUnit[] = [];
    if (tacdevronUnit.sections.length > 0) unitsWithPersonnel.push(tacdevronUnit);
    if (soarUnit.sections.length > 0) unitsWithPersonnel.push(soarUnit);
    if (dischargedUnit.sections.length > 0) unitsWithPersonnel.push(dischargedUnit);

    setMainUnits(unitsWithPersonnel);

    if (unitsWithPersonnel.length > 0 && !unitsWithPersonnel.some(unit => unit.id === selectedMainUnit)) {
      setSelectedMainUnit(unitsWithPersonnel[0].id);
    }
  }, [members, ranks, selectedMainUnit]);

  const currentMainUnit = mainUnits.find((unit) => unit.id === selectedMainUnit);

  return (
    <>
      <Tabs
        defaultValue={selectedMainUnit}
        onValueChange={(value) => setSelectedMainUnit(value)}
        className="mb-6"
      >
        <TabsList className="w-full flex flex-wrap">
          {mainUnits.map((unit) => (
            <TabsTrigger key={unit.id} value={unit.id} className="flex-grow">
              {unit.name}
            </TabsTrigger>
          ))}
        </TabsList>

      </Tabs>
      <div className="space-y-6">
        {currentMainUnit?.sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardTitle className="p-4 bg-accent/10 border-b border-border">{section.name}</CardTitle>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {section.personnel.map((person) => (

                  <li key={person.id} className="hover:bg-accent/5 transition-colors">
                    <Link href={`/perscom/user/${person.id}`} className="block p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={person.rankImage || "/placeholder.svg"}
                              alt={person.rank}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium mr-2">{person.name}</span>
                            <span className="text-sm text-gray-500 dark:text-zinc-400 hidden md:inline">
                              {person.rank}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-zinc-300 mr-4 hidden md:block">
                            {person.position}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">
                            {person.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

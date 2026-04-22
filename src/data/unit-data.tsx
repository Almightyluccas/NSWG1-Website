import type React from "react";

export interface InfoCardData {
  iconName: "compass" | "globe" | "graduation-cap";
  title: string;
  content: string;
  image: string;
}

export interface ContentSection {
  title: string;
  content: React.ReactNode;
}

export interface UnitData {
  slug: string;
  // Hero
  heroImage: string;
  emblemImage: string;
  title: string;
  titleHtml?: React.ReactNode;
  motto: string;
  description: string;
  // Info Cards
  infoCards: InfoCardData[];
  // General content sections (Requirements, What You Can Expect, etc.)
  contentSections: ContentSection[];
  // Pipeline steps (rendered as visual timeline)
  pipelineSteps: string[];
  // Career paths (rendered as role cards)
  careerPaths: { role: string; description?: string }[];
  // Join heading
  joinHeading: React.ReactNode;
  // SEO
  metaTitle: string;
  metaDescription: string;
}

export const units: Record<string, UnitData> = {
  tf160th: {
    slug: "tf160th",
    heroImage: "/images/160th/160th-hero.png",
    emblemImage: "/images/160th/160th-emblem.png",
    title: "TASK FORCE 160th",
    titleHtml: (
      <>
        TASK FORCE 160<sup>th</sup>
      </>
    ),
    motto: "Night Stalkers Don\u2019t Quit",
    description:
      "Task Force 160th, the elite aviation unit of Naval Special Warfare Group One, specializes in helicopter operations providing aviation support for special operations forces. With unmatched precision and skill, our pilots execute the most challenging missions in any environment, day or night.",
    infoCards: [
      {
        iconName: "compass",
        title: "160th Culture",
        content:
          "The 160th SOAR embodies excellence in aviation operations. Our pilots and crew maintain the highest standards of professionalism and skill. The unit's culture is built on precision, dedication, and the unwavering commitment to mission success.",
        image: "/images/160th/160th-culture.jpg",
      },
      {
        iconName: "graduation-cap",
        title: "160th Pipeline",
        content:
          "Joining the 160th requires exceptional piloting skills and dedication. Candidates undergo rigorous training in night operations, low-level flight, and special operations support. Only the most skilled and determined make it through our selection process.",
        image: "/images/160th/160th-pipeline.png",
      },
    ],
    contentSections: [

      {
        title: "Overview",
        content: (
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Providing aviation support for special operations missions.
            </li>
            <li>
              Conducting insertions and extractions of special operations forces.
            </li>
            <li>Executing precision strikes and close air support.</li>
            <li>Performing reconnaissance and surveillance operations.</li>
          </ul>
        ),
      },
      {
        title: "What You Can Expect",
        content: (
          <p>
            As a member of Task Force 160th, you&apos;ll be part of an elite
            aviation unit that operates in the most challenging environments.
            You&apos;ll receive specialized training in night operations,
            low-level flight, and special operations support. You&apos;ll work
            closely with other special operations units to execute complex
            missions requiring precision and skill.
          </p>
        ),
      }, {
        title: "Requirements",
        content: (
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Must be at least 17 years of age (Waivers can apply up to 16).
            </li>
            <li>Must have experience with helicopter flight in Arma 2.</li>
            <li>
              Must be able to attend Eastern Time Operations / Events. 8pm EST
              Wednesday/ Saturdays
            </li>
            <li>Must have a working Microphone (No static, echo, etc).</li>
            <li>
              Must be willing to learn advanced flight techniques and procedures.
            </li>
          </ul>
        ),
      },

    ],
    pipelineSteps: [
      "Application Approval",
      "Initial Flight Assessment",
      "Basic Flight Training",
      "Advanced Night Operations Training",
      "Special Operations Support Training",
      "Operational Assignment",
    ],
    careerPaths: [
      { role: "Pilot", description: "Lead aircraft commander" },
      { role: "Co-Pilot", description: "Secondary flight officer" },
      { role: "Crew Chief", description: "Aircraft systems specialist" },
      { role: "Door Gunner", description: "Aerial weapons operator" },
    ],
    joinHeading: (
      <>
        Join <span className="text-accent">Task Force 160th</span>
      </>
    ),
    metaTitle: "Task Force 160th | NSWG1",
    metaDescription:
      "Task Force 160th - Night Stalkers. Elite aviation unit specializing in helicopter operations and special operations aviation support.",
  },

  tacdevron2: {
    slug: "tacdevron2",
    heroImage: "/images/tacdev/tacdev-1.png",
    emblemImage: "/images/tacdev/tacdev-emblem.png",
    title: "NSWDG",
    motto: "The Only Easy Day Was Yesterday",
    description:
      "A key component of the Naval Special Warfare Development Group (DEVGRU), excels in specialized maritime and counter-terrorism operations. Join us to engage in high-impact missions with advanced tactics and cutting-edge technology, pushing the limits of special operations.",
    infoCards: [
      {
        iconName: "globe",
        title: "Overview",
        content:
          "Within NSWDG there is unmatched dedication among the members. Teamwork and dedication drive the unit tempo and culture. NSW Special Operators are dedicated to their roles and are constantly developing their tactics.",
        image: "/images/tacdev/tacdev-hero.png",
      },
      {
        iconName: "graduation-cap",
        title: "Work Environment",
        content:
          "Capturing high-value targets and terrorists worldwide. Conducting covert insertions and extractions by sea, air, or land. Gathering intelligence through special reconnaissance missions. Executing precision Direct Action, Hostage Rescue, Counter-Terrorism, and Special Recon operations with discipline and realism.",
        image: "/images/tacdev/tacdev-2.png",
      },
    ],
    contentSections: [
      {
        title: "What You Can Expect",
        content: (
          <p>
            As a green team graduate you will be a operational member of the unit
            and will be constantly evaluated on your skills but are fully
            responsible for any operational missions that you get tasked for.
            Along with that, there is a lot of advancement in the operational
            side of TACDEV one of the first operational tasks will be to become
            an instructor along with being an operator.
          </p>
        ),
      },
      {
        title: "Requirements",
        content: (
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Must be at least 18 years of age (Waivers can apply up to 16).
            </li>
            <li>
              Must be willing to submit to a lengthy and detailed training
              process.
            </li>
            <li>
              Must be able to attend Eastern Time Operations / Events. 9pm EST
              Wednesday/ Saturdays
            </li>
            <li>Must have a working Microphone (No static, echo, etc).</li>
          </ul>
        ),
      },
    ],
    pipelineSteps: [
      "Application Approval",
      "Interview",
      "Green Team",
    ],
    careerPaths: [
      { role: "SO/SEAL", description: "Special Operator" },
      { role: "EOD", description: "Explosive Ordinance Disposal" },
      { role: "HM", description: "Special Operations Independent Corpsman" },
      { role: "AWR/JTAC", description: "Joint Terminal Attack Controller" },
    ],
    joinHeading: (
      <>
        Join <span className="text-accent">TACDEVRON2</span>
      </>
    ),
    metaTitle: "TACDEVRON2 - NSWDG | NSWG1",
    metaDescription:
      "Naval Special Warfare Development Group (DEVGRU) - Maritime special operations force conducting specialized counter-terrorism missions worldwide.",
  },
};

export function getUnit(slug: string): UnitData | undefined {
  return units[slug];
}

export function getAllUnitSlugs(): string[] {
  return Object.keys(units);
}

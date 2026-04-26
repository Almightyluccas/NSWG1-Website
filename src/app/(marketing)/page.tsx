import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Target, Users } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { UnitCard } from "@/components/ui/unit-card";
import { StatCard } from "@/components/ui/stat-card";
import { YouTubePlayer } from "@/components/ui/youtube-player";
import { Footer } from "@/components/layout/footer";
import { ReadyToJoinSection } from "@/components/ui/ready-to-join-section";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/database";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect members to their dashboard
  if (session?.user?.roles?.includes(UserRole.member)) {
    redirect("/dashboard");
  }
  const defaultImage =
    "https://objectstorage.us-ashburn-1.oraclecloud.com/p/iLmoMrwA0_K72E-4Zhpr0pHNkbV06LFu10NzW8ZrDKj7gUS5by1WoD8eZpCSP4Xe/n/id8volxantwo/b/nswg1-bucket/o/backgrounds/home-backgroundArma3_x64_2025-12-06_12-24-53_6102.png";
  const heroImageSrc = defaultImage;
  return (
    <main className="min-h-screen bg-zinc-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageSrc}
            alt="Hero background"
            fill
            className="object-cover brightness-[0.55]"
            priority
            quality={95}
            sizes={"100vw"}
          />
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-zinc-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
          {/* Subtle radial vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 z-10 pt-20">
          <div className="max-w-5xl">
            <FadeIn>
              <div className="flex items-start gap-8 md:gap-12">
                {/* Unit Emblem */}
                <div className="hidden md:block flex-shrink-0">
                  <div
                    className="relative w-32 h-32 lg:w-40 lg:h-40"
                    style={{
                      filter:
                        "drop-shadow(0 0 20px rgba(var(--accent-color), 0.2))",
                    }}
                  >
                    <Image
                      src="/images/nswg1-emblem.png"
                      alt="NSWG1 Emblem"
                      fill
                      className="object-contain"
                      sizes="160px"
                    />
                  </div>
                </div>

                {/* Hero Content */}
                <div className="flex-1">
                  <p className="section-label mb-4">
                    {"Naval Special Warfare"}
                  </p>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 leading-[1.1] text-white uppercase tracking-wide">
                    <span className="text-accent">NAVAL</span> SPECIAL
                    <br />
                    WARFARE GROUP ONE
                  </h1>
                  <div className="h-1 w-32 bg-accent my-6"></div>
                  <p className="text-xl md:text-2xl text-gray-300 mb-3 max-w-2xl leading-relaxed">
                    Tactical operations built on precision, planning, and proven
                    skill.
                  </p>
                  <p className="text-lg italic text-zinc-500 mb-10 font-light tracking-wide">
                    The Only Easy Day Was Yesterday
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/join">
                      <Button
                        size="lg"
                        className="bg-accent hover:bg-accent-darker text-black font-semibold uppercase tracking-wider px-8"
                      >
                        Recruitment <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-zinc-500 hover:bg-white/10 hover:border-accent/50 text-white bg-transparent uppercase tracking-wider px-8 transition-all duration-300"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            Scroll
          </span>
          <div className="animate-bounce">
            <ChevronRight className="h-6 w-6 text-accent/70 rotate-90" />
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Stats Section */}
      <section className="py-20 bg-zinc-900 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <StatCard
              className="h-full"
              icon={<Shield className="h-10 w-10 text-accent" />}
              number="2+"
              label="Years of Operational Experience"
              description="Conducting organized tactical operations and training exercises since 2022."
            />
            <StatCard
              className="h-full"
              icon={<Users className="h-10 w-10 text-accent" />}
              number="High Personnel Participation"
              label="Participation Rate"
              description="Consistent member engagement ensures reliable team readiness and effective mission execution."
            />
            <StatCard
              className="h-full"
              icon={<Target className="h-10 w-10 text-accent" />}
              number="Operational Training Cycle"
              label="Successful Operations"
              description="Routine operations and structured training maintain team proficiency and readiness."
            />
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* About Section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/160th/160th-lil-birds-night.jpg"
            alt="Military operation"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-zinc-950/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-transparent to-zinc-900"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Text Floating Box */}
            <FadeIn>
              <div className="h-full bg-zinc-900/70 backdrop-blur-md border-2 border-accent/60 rounded-lg p-10 shadow-[0_0_30px_rgba(var(--accent-color),0.08)] hover:shadow-[0_0_40px_rgba(var(--accent-color),0.15)] transition-all duration-500">
                <p className="section-label mb-4">{"About"}</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wide">
                  About us
                </h2>
                <div className="h-1 w-24 bg-accent mb-8"></div>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  Naval Special Warfare Group One (NSWG-1) conducts
                  realism-focused operations emphasizing disciplined small-unit
                  tactics and precise mission planning.
                </p>
                <p className="text-lg text-zinc-300 leading-relaxed">
                  The unit operates with coordinated execution, controlled
                  communications, and strict adherence to operational standards
                  across all mission sets.
                </p>
              </div>
            </FadeIn>

            {/* Video Floating Box */}
            <FadeIn delay={200}>
              <div className="h-full bg-zinc-900/70 backdrop-blur-md border-2 border-accent/60 rounded-lg p-4 shadow-[0_0_30px_rgba(var(--accent-color),0.08)] hover:shadow-[0_0_40px_rgba(var(--accent-color),0.15)] transition-all duration-500 flex flex-col">
                <p className="section-label mb-3 px-2">
                  {"Operations Overview"}
                </p>
                <div className="flex-1">
                  <YouTubePlayer
                    videoId="LyKKQ4Ocowg"
                    title="NSWG-1 Operations Overview"
                    thumbnail="/images/home-page-thumbnail.png"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Units Section */}
      <section className="py-28 bg-zinc-900 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(var(--accent-color)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              {/* Flanking lines around label */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40"></div>
                <p className="section-label">{"Career Paths"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wide">
                Career Paths
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Our specialized teams operate across diverse environments, each
                bringing unique capabilities to execute the most challenging
                missions with precision and expertise.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-8xl mx-auto">
            <UnitCard
              image="/images/160th/160th-emblem.png"
              title="160th Special Operations Aviation Regiment"
              description="Night Stalkers - Specialized in helicopter operations providing aviation support for special operations forces."
              backgroundImage="/images/160th/160th-card.png"
              href="/units/tf160th"
              delay={0}
              backgroundPosition="center top"
            />

            <UnitCard
              image="/images/tacdev/tacdev-emblem.png"
              title="Naval Special Warfare Development Group (NSWDG)"
              description="Maritime special operations force conducting specialized missions worldwide."
              backgroundImage="/images/tacdev/tacdev-4man.png"
              href="/units/tacdevron2"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* <ReadyToJoinSection /> */}

      <Footer />
    </main>
  );
}

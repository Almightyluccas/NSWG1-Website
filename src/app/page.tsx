import Image from "next/image"
import { FadeIn } from "@/components/fade-in"
import { Button } from "@/components/ui/button"
import {ChevronRight, Shield, Target, Users} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UnitCard } from "@/components/unit-card"
import { StatCard } from "@/components/stat-card"
import { VideoPlayer } from "@/components/video-player"
import {Footer} from "@/components/footer";
import {ReadyToJoinSection} from "@/components/ready-to-join-section";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-100 dark:to-zinc-900">
            <Image
                src="/images/tacdev/hero-background.png"
                alt="Hero background"
                fill
                className="object-cover brightness-50"
                priority
            />
          {/*<video autoPlay muted loop playsInline className="w-full h-full object-cover">*/}
          {/*  <source src="/videos/hero-background.mp4" type="video/mp4" />*/}
          {/*</video>*/}
          </div>
        </div>

        <div className="container mx-auto px-4 z-10 pt-20">
          <div className="max-w-4xl">
            <FadeIn>
              <h1 className="text-5xl md:text-7xl font-bold mb-2 leading-tight text-white">
                <span className="text-accent">NAVAL</span> SPECIAL
                <br />
                WARFARE GROUP ONE
              </h1>
              <div className="h-1 w-24 bg-accent my-6"></div>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Tactical operations built on precision, planning, and proven skill.
                <span className="block mt-2 italic text-gray-400">The Only Easy Day Was Yesterday</span>
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/join">
                  <Button size="lg" className="bg-accent hover:bg-accent-darker text-black" >
                    Recruitment <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800 text-white">
                  Learn More
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="animate-bounce">
            <ChevronRight className="h-8 w-8 text-accent rotate-90" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
              icon={<Shield className="h-10 w-10 text-accent" />}
              number="3+"
              label="Years of Excellence"
              description="Setting the standard in tactical operations since 2022"
            />
            <StatCard
              icon={<Target className="h-10 w-10 text-accent" />}
              number="100+"
              label="Successful Operations"
              description="Precision execution across diverse operational environments"
            />
            <StatCard
              icon={<Users className="h-10 w-10 text-accent" />}
              number="90%"
              label="Participation Rate"
              description="Consistent engagement from our personnel drives the operational precision and strategic advantage that distinguish us from our counterparts"
            />
          </div>
        </div>
      </section>

      {/* Realism Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/160th/160th-lil-birds-night.jpg"
            alt="Military operation"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 border-l-2 border-t-2 border-accent opacity-50"></div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Authentic Realism, <span className="text-accent">Unmatched Experience</span>
                </h2>
                <div className="h-1 w-24 bg-accent mb-8"></div>
                <p className="text-lg text-zinc-300 mb-6">
                  At the heart of NSWG-1 lies a commitment to unparalleled realism. As a dedicated representation of the
                  Naval Special Warfare Group One, we meticulously replicate every aspect of military operations.
                </p>
                <p className="text-lg text-zinc-300 mb-8">
                  From tactics and procedures to precise equipment and environmental details, our unit ensures
                  that every mission and training scenario mirrors real-world conditions.
                </p>
                <Button className="bg-accent hover:bg-accent-darker text-black">Discover Our Approach</Button>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 border-r-2 border-b-2 border-accent opacity-50"></div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <VideoPlayer src="/videos/bomb.mp4" poster="/images/tactical-training.png" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Units Section */}
      <section className="py-24 bg-zinc-800/50">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Elite Units of <span className="text-accent">NSWG1</span>
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-zinc-300">
                Our specialized teams operate across diverse environments, each bringing unique capabilities to execute
                the most challenging missions with precision and expertise.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-8">*/}
            <UnitCard
              image="/images/160th/160th-emblem.png"
              title="Task Force 160th"
              description="Night Stalkers - Specialized in helicopter operations providing aviation support for special operations forces."
              backgroundImage="/images/160th/160th-card.png"
              href="/tf160th"
              delay={0}
              backgroundPosition="center top"
            />

            <UnitCard
              image="/images/tacdev/tacdev-emblem.png"
              title="TACDEVRON2"
              description="Elite maritime special operations force conducting specialized missions worldwide."
              backgroundImage="/images/tacdev/tacdev-4man.png"
              href="/tacdevron2"
              delay={200}
            />

            {/*<UnitCard*/}
            {/*  image="/images/24thsts-logo.png"*/}
            {/*  title="24th Special Tactics Squadron"*/}
            {/*  description="Air Force special tactics operators providing global special operations capabilities."*/}
            {/*  backgroundImage="/images/afsoc-header-background.png"*/}
            {/*  href="/24thsts"*/}
            {/*  delay={400}*/}
            {/*/>*/}
          </div>
        </div>
      </section>

      <ReadyToJoinSection />
      <Footer />
    </main>
  )
}

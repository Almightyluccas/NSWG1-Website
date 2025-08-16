import Image from "next/image"
import { FadeIn } from "@/components/ui/fade-in"
import { Navbar } from "@/components/layout/navbar"
import { AccordionSection } from "@/components/ui/accordion-section"
import { InfoCard } from "@/components/ui/info-card"
import { Compass, GraduationCap } from "lucide-react"

export default function TF160thPage() {
    return (
        <main className="bg-zinc-900 text-white min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-900"></div>
                    <Image
                        src="/images/160th/160th-hero.png"
                        alt="160th SOAR Header"
                        fill
                        className="object-cover opacity-70"
                        priority
                    />
                </div>

                <div className="container mx-auto px-4 z-10 pt-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <FadeIn>
                            <div className="flex justify-center mb-8">
                                <Image
                                    src="/images/160th/160th-emblem.png"
                                    alt="160th SOAR Emblem"
                                    width={250}
                                    height={250}
                                    className="object-contain"
                                />
                            </div>
                        </FadeIn>

                        <FadeIn delay={200}>
                            <h1 className="text-5xl md:text-7xl font-bold mb-2">
                                TASK FORCE 160<sup>th</sup>
                            </h1>
                            <p className="text-xl italic text-zinc-300 mb-8">Night Stalkers Don&apos;t Quit</p>
                            <div className="h-1 w-24 bg-accent mx-auto my-6"></div>
                            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                                Task Force 160th, the elite aviation unit of Naval Special Warfare Group One, specializes in helicopter
                                operations providing aviation support for special operations forces. With unmatched precision and skill,
                                our pilots execute the most challenging missions in any environment, day or night.
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Info Cards Section */}
            <section className="py-20 bg-zinc-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <InfoCard
                            icon={<Compass className="h-10 w-10 text-accent" />}
                            title="160th Culture"
                            content="The 160th SOAR embodies excellence in aviation operations. Our pilots and crew maintain the highest standards of professionalism and skill. The unit's culture is built on precision, dedication, and the unwavering commitment to mission success."
                            image="/images/160th/160th-culture.jpg"
                            delay={0}
                        />

                        <InfoCard
                            icon={<GraduationCap className="h-10 w-10 text-accent" />}
                            title="160th Pipeline"
                            content="Joining the 160th requires exceptional piloting skills and dedication. Candidates undergo rigorous training in night operations, low-level flight, and special operations support. Only the most skilled and determined make it through our selection process."
                            image="/images/160th/160th-pipeline.png"
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* Accordion Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/*bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/70*/}
                    <div className="absolute inset-0 "></div>
                    {/*<Image*/}
                    {/*    src="/images/160th/160th-lil-bird-loaded.png"*/}
                    {/*    alt="160th Background"*/}
                    {/*    fill*/}
                    {/*    className="object-cover opacity-20"*/}
                    {/*/>*/}
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <FadeIn>
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold text-center mb-12">
                                Join <span className="text-accent">Task Force 160th</span>
                            </h2>

                            <div className="space-y-6">
                                <AccordionSection
                                    title="Requirements"
                                    content={
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>Must be at least 18 years of age (Waivers can apply up to 16).</li>
                                            <li>Must have experience with helicopter flight in Arma 3.</li>
                                            <li>Must be able to attend Eastern Time Operations / Events. 9pm EST Wednesday/ Saturdays</li>
                                            <li>Must have a working Microphone (No static, echo, etc).</li>
                                            <li>Must be willing to learn advanced flight techniques and procedures.</li>
                                        </ul>
                                    }
                                    delay={0}
                                />

                                <AccordionSection
                                    title="Overview"
                                    content={
                                        <>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li>Providing aviation support for special operations missions.</li>
                                                <li>Conducting insertions and extractions of special operations forces.</li>
                                                <li>Executing precision strikes and close air support.</li>
                                                <li>Performing reconnaissance and surveillance operations.</li>
                                            </ul>
                                            <div className="mt-6">
                                                <h3 className="text-xl font-bold mb-2">Career Paths</h3>
                                                <ul className="list-disc pl-5">
                                                    <li>Pilot</li>
                                                    <li>Co-Pilot</li>
                                                    <li>Crew Chief</li>
                                                    <li>Door Gunner</li>
                                                </ul>
                                            </div>
                                        </>
                                    }
                                    delay={100}
                                />

                                <AccordionSection
                                    title="What You Can Expect"
                                    content={
                                        <p>
                                            As a member of Task Force 160th, you&apos;ll be part of an elite aviation unit that operates in the
                                            most challenging environments. You&apos;ll receive specialized training in night operations, low-level
                                            flight, and special operations support. You&apos;ll work closely with other special operations units to
                                            execute complex missions requiring precision and skill.
                                        </p>
                                    }
                                    delay={200}
                                />

                                <AccordionSection
                                    title="Pipeline"
                                    content={
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>Application Approval</li>
                                            <li>Initial Flight Assessment</li>
                                            <li>Basic Flight Training</li>
                                            <li>Advanced Night Operations Training</li>
                                            <li>Special Operations Support Training</li>
                                            <li>Operational Assignment</li>
                                        </ul>
                                    }
                                    delay={300}
                                />
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold">
                                <span className="text-accent">NSWG</span>1
                            </h3>
                            <p className="text-zinc-400 mt-2">Night Stalkers Don&apos;t Quit</p>
                        </div>

                        <div className="flex flex-wrap gap-4 md:gap-8">
                            <a href="/about" className="text-zinc-400 hover:text-accent transition-colors">
                                About
                            </a>
                            <div className="flex flex-col">
                                <span className="text-zinc-400 font-medium mb-2">Units</span>
                                <a href="/tf160th" className="text-zinc-500 hover:text-accent transition-colors text-sm mb-1">
                                    Task Force 160th
                                </a>
                                <a href="/tacdevron2" className="text-zinc-500 hover:text-accent transition-colors text-sm">
                                    TACDEVRON2
                                </a>
                            </div>
                            <a href="/gallery" className="text-zinc-400 hover:text-accent transition-colors">
                                Gallery
                            </a>
                            <a href="/join" className="text-zinc-400 hover:text-accent transition-colors">
                                Join
                            </a>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500 text-sm">
                        © {new Date().getFullYear()} Naval Special Warfare Group One. All rights reserved.
                    </div>
                </div>
            </footer>
        </main>
    )
}

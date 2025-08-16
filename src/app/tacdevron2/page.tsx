import Image from "next/image"
import { FadeIn } from "@/components/ui/fade-in"
import { Navbar } from "@/components/layout/navbar"
import { AccordionSection } from "@/components/ui/accordion-section"
import { InfoCard } from "@/components/ui/info-card"
import { GlobeIcon as GlobeHemisphereWest, GraduationCap } from "lucide-react"
import {Footer} from "@/components/layout/footer";

export default function Tacdevron2Page() {
  return (
    <main className="bg-zinc-900 text-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-900"></div>
          <Image src="/images/tacdev/tacdev-1.png" alt="TACDEVRON2 Header" fill className="object-cover opacity-70" priority />
        </div>

        <div className="container mx-auto px-4 z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <div className="flex justify-center mb-8">
                <Image
                  src="/images/tacdev/tacdev-emblem.png"
                  alt="TACDEVRON2 Logo"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold mb-2">TACDEVRON2</h1>
              <p className="text-xl italic text-zinc-300 mb-8">The Only Easy Day Was Yesterday</p>
              <div className="h-1 w-24 bg-accent mx-auto my-6"></div>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                A key component of the Naval Special Warfare Development Group (DEVGRU), excels in specialized maritime
                and counter-terrorism operations. Join us to engage in high-impact missions with advanced tactics and
                cutting-edge technology, pushing the limits of special operations.
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
              icon={<GlobeHemisphereWest className="h-10 w-10 text-accent" />}
              title="TACDEVRON2 Culture"
              content="Within TACDEVRON2 there is unmatched dedication among the members. Teamwork and dedication drive the unit tempo and culture. NSW Special Operators are dedicated to their roles and are constantly developing their tactics."
              image="/images/tacdev/tacdev-hero.png"
              delay={0}
              className="h-full"
            />

            <InfoCard
              icon={<GraduationCap className="h-10 w-10 text-accent" />}
              title="TACDEVRON2 Pipeline"
              content="NSWG1 has a dedicated pipeline, BUD/s, which allows members to show teamwork and dedication to the unit. Highly experienced instructing staff and a tailored training environment make NSWG1 a great place to develop members' skills."
              image="/images/tacdev/tacdev-2.png"
              delay={200}
              className="h-full"
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
          {/*  src="/images/tacdev/tacdevron2-background.png"*/}
          {/*  alt="TACDEVRON2 Background"*/}
          {/*  fill*/}
          {/*  className="object-cover opacity-20"*/}
          {/*/>*/}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12">
                Join <span className="text-accent">TACDEVRON2</span>
              </h2>

              <div className="space-y-6">
                <AccordionSection
                  title="Requirements"
                  content={
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Must be at least 18 years of age (Waivers can apply up to 16).</li>
                      <li>Must be willing to submit to a lengthy and detailed training process.</li>
                      <li>Must be able to attend Eastern Time Operations / Events. 9pm EST Wednesday/ Saturdays</li>
                      <li>Must have a working Microphone (No static, echo, etc).</li>
                    </ul>
                  }
                  delay={0}
                />

                <AccordionSection
                  title="Overview"
                  content={
                    <>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Capturing high-value enemy personnel and terrorists around the world.</li>
                        <li>
                          Conducting insertions and extractions by sea, air or land to accomplish covert, Special
                          Warfare/Special Operations missions.
                        </li>
                        <li>Collecting information and intelligence through special reconnaissance missions.</li>
                      </ul>
                      <div className="mt-6">
                        <h3 className="text-xl font-bold mb-2">Career Paths</h3>
                        <ul className="list-disc pl-5">
                          <li>SO/SEAL</li>
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
                      As a green team graduate you will be a operational member of the unit and will be constantly
                      evaluated on your skills but are fully responsible for any operational missions that you get
                      tasked for. Along with that, there is a lot of advancement in the operational side of TACDEV one
                      of the first operational tasks will be to become an instructor along with being an operator.
                    </p>
                  }
                  delay={200}
                />

                <AccordionSection
                  title="Pipeline"
                  content={
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Application Approval</li>
                      <li>Interview</li>
                      <li>S&T Selection</li>
                      <li>Green Team</li>
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
      <Footer />
    </main>
  )
}

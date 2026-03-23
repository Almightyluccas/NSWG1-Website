"use server";

import type React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { FadeIn } from "@/components/ui/fade-in";
import { Shield, Target, Users, Award, Clock, Globe } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { ReadyToJoinSection } from "@/components/ui/ready-to-join-section";

export default async function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/3-troops-walking-lil-bird.png"
            alt="About NSWG1"
            fill
            className="object-cover brightness-[0.55]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-zinc-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <p className="section-label mb-4">{"About"}</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 uppercase tracking-wide">
                About <span className="text-accent">NSWG1</span>
              </h1>
              <div className="h-1 w-24 bg-accent mx-auto my-6"></div>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                Naval Special Warfare Group One: Elite tactical operations where
                precision, strategy, and unmatched expertise converge.
              </p>
              <p className="text-lg italic text-zinc-500 mt-4 font-light tracking-wide">
                The Only Easy Day Was Yesterday
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════ MISSION ═══════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tacdev/soldiers-looking-sun.png"
            alt="Military operation"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-zinc-950/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-transparent to-zinc-900"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Text Floating Box */}
            <FadeIn>
              <div className="h-full bg-zinc-900/70 backdrop-blur-md border-2 border-accent/60 rounded-lg p-10 shadow-[0_0_30px_rgba(var(--accent-color),0.08)] hover:shadow-[0_0_40px_rgba(var(--accent-color),0.15)] transition-all duration-500">
                <p className="section-label mb-4">{"Our Mission"}</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wide">
                  Our Mission
                </h2>
                <div className="h-1 w-24 bg-accent mb-8"></div>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  Naval Special Warfare Group One (NSWG1) is dedicated to
                  providing the most realistic and immersive military simulation
                  experience possible. Our mission is to create an environment
                  where tactics, teamwork, and precision are paramount.
                </p>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  We strive to replicate the professionalism, discipline, and
                  operational excellence of real-world special operations
                  forces, while fostering a community of dedicated individuals
                  who are passionate about military simulation.
                </p>
                <p className="text-lg text-zinc-300 leading-relaxed">
                  Through rigorous training, authentic scenarios, and attention
                  to detail, we aim to deliver an unparalleled tactical
                  experience that challenges and develops each member&apos;s
                  skills.
                </p>
              </div>
            </FadeIn>

            {/* Image Floating Box */}
            <FadeIn delay={200}>
              <div className="h-full bg-zinc-900/70 backdrop-blur-md border-2 border-accent/60 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(var(--accent-color),0.08)] hover:shadow-[0_0_40px_rgba(var(--accent-color),0.15)] transition-all duration-500 flex flex-col">
                <p className="section-label mb-3 px-6 pt-6">
                  {"Elite Training"}
                </p>
                <div className="flex-1 relative min-h-[400px]">
                  <Image
                    src="/images/tacdev/3-soldiers-training-targets.png"
                    alt="NSWG1 Mission"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                      Elite Training
                    </h3>
                    <p className="text-zinc-300">
                      Developing the next generation of operators
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════ CORE VALUES ═══════ */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
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
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40"></div>
                <p className="section-label">{"Core Values"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wide">
                Core Values
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-zinc-400 leading-relaxed">
                At NSWG1, we uphold a set of core values that guide everything
                we do. These principles shape our operations, training, and
                community.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard
              icon={<Shield className="h-10 w-10 text-accent" />}
              title="Integrity"
              description="We maintain the highest standards of honesty and ethical conduct in all our operations and interactions."
              delay={0}
            />
            <ValueCard
              icon={<Target className="h-10 w-10 text-accent" />}
              title="Excellence"
              description="We strive for excellence in all aspects of our training, operations, and community engagement."
              delay={100}
            />
            <ValueCard
              icon={<Users className="h-10 w-10 text-accent" />}
              title="Teamwork"
              description="We believe in the power of cohesive teams working together toward common objectives."
              delay={200}
            />
            <ValueCard
              icon={<Award className="h-10 w-10 text-accent" />}
              title="Discipline"
              description="We maintain strict discipline in our training and operations to ensure safety and effectiveness."
              delay={300}
            />
            <ValueCard
              icon={<Clock className="h-10 w-10 text-accent" />}
              title="Dedication"
              description="We are dedicated to continuous improvement and the pursuit of tactical excellence."
              delay={400}
            />
            <ValueCard
              icon={<Globe className="h-10 w-10 text-accent" />}
              title="Adaptability"
              description="We adapt to changing environments and challenges with flexibility and resilience."
              delay={500}
            />
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(var(--accent-color)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40"></div>
                <p className="section-label">{"Enlistment Requirements"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                Requirements to Join
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mt-6" />
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              "You must be at least 18 years of age (Waivers can apply).",
              "You must be willing to submit to a lengthy and detailed training process.",
              "You must be able to attend Eastern Time Operations / Events.",
              "You must have a working Microphone (No static, echo, etc).",
            ].map((req, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-700/40 rounded-lg overflow-hidden hover:border-accent/40 hover:shadow-[0_0_25px_rgba(var(--accent-color),0.06)] transition-all duration-500">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-accent/50 flex items-center justify-center group-hover:border-accent transition-all duration-500">
                      <span className="text-accent font-mono text-sm font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-zinc-700" />
                    <p className="text-zinc-300 leading-relaxed">{req}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════ LEADERSHIP ═══════ */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
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
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40"></div>
                <p className="section-label">{"Command Staff"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wide">
                Our Leadership
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-zinc-400 leading-relaxed">
                NSWG1 is led by a team of experienced individuals dedicated to
                maintaining the highest standards of tactical excellence.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/*TODO: Replace with actual images*/}
            {/*TODO: Add the name and role from perscom so i dont need to update in future*/}
            <LeaderCard
              name="Lieutenant Commander J. Rola"
              role="Troop Commander"
              image="/placeholder.svg?height=300&width=300"
              delay={0}
            />
            <LeaderCard
              name="Major R. Stanman"
              role="160th Commanding officer"
              image="/placeholder.svg?height=300&width=300"
              delay={200}
            />
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <ReadyToJoinSection />
      <Footer />
    </main>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function ValueCard({ icon, title, description, delay = 0 }: ValueCardProps) {
  return (
    <FadeIn delay={delay}>
      <div className="group bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/40 rounded-lg p-6 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.1)] transition-all duration-500 h-full">
        <div className="w-14 h-14 rounded-full border-2 border-accent/50 flex items-center justify-center mb-5 group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(var(--accent-color),0.2)] transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-zinc-400">{description}</p>
      </div>
    </FadeIn>
  );
}

interface LeaderCardProps {
  name: string;
  role: string;
  image: string;
  delay?: number;
}

function LeaderCard({ name, role, image, delay = 0 }: LeaderCardProps) {
  return (
    <FadeIn delay={delay}>
      <div className="group bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/40 rounded-lg overflow-hidden hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.1)] transition-all duration-500">
        <div className="relative h-64">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-1 uppercase tracking-wide">
            {name}
          </h3>
          <p className="text-zinc-400 text-sm tracking-wider uppercase">
            {role}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

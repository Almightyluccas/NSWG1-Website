"use server";

import type React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { FadeIn } from "@/components/ui/fade-in";
import { Shield, Target, Users, Award, Clock, Globe } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { ReadyToJoinSection } from "@/components/ui/ready-to-join-section";
import { RequirementItem } from "@/components/ui/requirment-list-items";

export default async function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10"></div>
          <Image
            src="/images/3-troops-walking-lil-bird.png"
            alt="About NSWG1"
            fill
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-4 z-10 relative py-20">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4">
              About <span className="text-accent">NSWG1</span>
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Naval Special Warfare Group One: Elite tactical operations where
              precision, strategy, and unmatched expertise converge.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                <div className="h-1 w-24 bg-accent mb-8"></div>
                <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
                  Naval Special Warfare Group One (NSWG1) is dedicated to
                  providing the most realistic and immersive military simulation
                  experience possible. Our mission is to create an environment
                  where tactics, teamwork, and precision are paramount.
                </p>
                <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
                  We strive to replicate the professionalism, discipline, and
                  operational excellence of real-world special operations
                  forces, while fostering a community of dedicated individuals
                  who are passionate about military simulation.
                </p>
                <p className="text-lg text-gray-700 dark:text-zinc-300">
                  Through rigorous training, authentic scenarios, and attention
                  to detail, we aim to deliver an unparalleled tactical
                  experience that challenges and develops each member&apos;s
                  skills.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/tacdev/3-soldiers-training-targets.png"
                  alt="NSWG1 Mission"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Elite Training
                  </h3>
                  <p className="text-gray-300">
                    Developing the next generation of operators
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Core Values</h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 dark:text-zinc-300">
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

      {/* Replace Stats Section with Requirements Section */}
      <section className="py-20 bg-white dark:bg-zinc-800">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-6">Requirements to Join</h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 dark:text-zinc-300 mb-8">
                Before applying to join NSWG1, please ensure you meet the
                following requirements:
              </p>
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 dark:bg-zinc-700/30 rounded-lg p-8 border border-gray-200 dark:border-zinc-700">
              <ul className="space-y-6">
                <RequirementItem>
                  You must be at least 18 years of age (Waivers can apply).
                </RequirementItem>
                <RequirementItem>
                  You must be willing to submit to a lengthy and detailed
                  training process.
                </RequirementItem>
                <RequirementItem>
                  You must be able to attend Eastern Time Operations / Events.
                </RequirementItem>
                <RequirementItem>
                  You must have a working Microphone (No static, echo, etc).
                </RequirementItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Leadership</h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-gray-700 dark:text-zinc-300">
                NSWG1 is led by a team of experienced individuals dedicated to
                maintaining the highest standards of tactical excellence.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-zinc-700">
        <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-lg inline-block mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-zinc-400">{description}</p>
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
      <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-zinc-700">
        <div className="relative h-64">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-1">{name}</h3>
          <p className="text-gray-600 dark:text-zinc-400">{role}</p>
        </div>
      </div>
    </FadeIn>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/fade-in";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InfoCard } from "@/components/ui/info-card";
import { Compass, GlobeIcon, GraduationCap, ChevronRight } from "lucide-react";
import { getUnit, getAllUnitSlugs } from "@/data/unit-data";

const iconMap = {
  compass: <Compass className="h-10 w-10 text-accent" />,
  globe: <GlobeIcon className="h-10 w-10 text-accent" />,
  "graduation-cap": <GraduationCap className="h-10 w-10 text-accent" />,
};

export function generateStaticParams() {
  return getAllUnitSlugs().map((slug) => ({ unit: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unit: string }>;
}): Promise<Metadata> {
  const { unit: slug } = await params;
  const unit = getUnit(slug);
  if (!unit) return { title: "Unit Not Found" };
  return { title: unit.metaTitle, description: unit.metaDescription };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ unit: string }>;
}) {
  const { unit: slug } = await params;
  const unit = getUnit(slug);
  if (!unit) notFound();

  return (
    <main className="bg-zinc-900 text-white min-h-screen">
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={unit.heroImage}
            alt={`${unit.title} Header`}
            fill
            className="object-cover brightness-[0.55]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-zinc-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <div className="flex justify-center mb-8">
                <div>
                  <Image
                    src={unit.emblemImage}
                    alt={`${unit.title} Emblem`}
                    width={250}
                    height={250}
                    className="object-contain"
                  />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold mb-2 uppercase tracking-wide">
                {unit.titleHtml || unit.title}
              </h1>
              <p className="text-xl italic text-zinc-400 mb-8 tracking-wide">
                {unit.motto}
              </p>
              <div className="h-1 w-24 bg-accent mx-auto my-6" />
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                {unit.description}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ CAREER PATHS (first — grabs attention) ═══════ */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40" />
                <p className="section-label">{"// Specializations"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                Career Paths
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mt-6" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {unit.careerPaths.map((path, i) => (
              <FadeIn key={path.role} delay={i * 100}>
                <div className="group relative bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/40 rounded-lg p-6 text-center hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.1)] transition-all duration-500 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-accent/50 flex items-center justify-center mb-4 group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(var(--accent-color),0.2)] transition-all duration-500">
                    <span className="text-accent font-mono text-lg font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-wider mb-2">
                    {path.role}
                  </h4>
                  {path.description && (
                    <p className="text-zinc-400 text-sm">{path.description}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════ PIPELINE (second — visual timeline) ═══════ */}
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
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40" />
                <p className="section-label">{"// Selection Process"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                Pipeline
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mt-6" />
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/50 to-accent" />

            <div className="space-y-0">
              {/* START marker */}
              <FadeIn direction="left">
                <div className="flex items-center gap-6 md:gap-8 mb-8">
                  <div className="flex-shrink-0 w-12 md:w-16 flex justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_14px_rgba(var(--accent-color),0.6)]" />
                  </div>
                  <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase font-semibold">
                    Start Here
                  </span>
                </div>
              </FadeIn>

              {unit.pipelineSteps.map((step, i) => {
                const padded = String(i + 1).padStart(2, "0");
                const isLast = i === unit.pipelineSteps.length - 1;
                return (
                  <FadeIn key={step} delay={i * 150} direction="left">
                    <div className="flex items-stretch gap-6 md:gap-8 group mb-8">
                      {/* Node */}
                      <div className="flex-shrink-0 flex flex-col items-center z-10">
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isLast
                              ? "bg-accent/20 border-2 border-accent shadow-[0_0_25px_rgba(var(--accent-color),0.4)]"
                              : "bg-zinc-800 border-2 border-zinc-400 group-hover:border-accent group-hover:shadow-[0_0_18px_rgba(var(--accent-color),0.2)]"
                          }`}
                        >
                          <span
                            className={`font-mono font-bold text-sm md:text-base transition-colors duration-300 ${
                              isLast
                                ? "text-accent"
                                : "text-white group-hover:text-white"
                            }`}
                          >
                            {padded}
                          </span>
                        </div>
                      </div>

                      {/* Content card */}
                      <div
                        className={`flex-1 rounded-lg px-6 py-5 transition-all duration-500 ${
                          isLast
                            ? "bg-accent/10 border border-accent/50 shadow-[0_0_25px_rgba(var(--accent-color),0.12)]"
                            : "bg-zinc-900/80 border border-zinc-700/60 group-hover:border-accent/40 group-hover:shadow-[0_0_18px_rgba(var(--accent-color),0.06)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-accent font-mono text-xs tracking-widest uppercase">
                              Phase {padded}
                            </span>
                            <h4
                              className={`text-lg md:text-xl font-bold uppercase tracking-wide mt-1 ${
                                isLast ? "text-accent" : "text-zinc-200"
                              }`}
                            >
                              {step}
                            </h4>
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 transition-all duration-300 ${
                              isLast
                                ? "text-accent"
                                : "text-zinc-600 group-hover:text-accent/60 group-hover:translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}

              {/* END marker */}
              <FadeIn delay={unit.pipelineSteps.length * 150} direction="left">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="flex-shrink-0 w-12 md:w-16 flex justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_12px_rgba(var(--accent-color),0.5)]" />
                  </div>
                  <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase font-bold">
                    Operational
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════ INFO CARDS ═══════ */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40" />
                <p className="section-label">{"// Unit Overview"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {unit.infoCards.map((card, i) => (
              <InfoCard
                key={card.title}
                icon={iconMap[card.iconName]}
                title={card.title}
                content={card.content}
                image={card.image}
                delay={i * 200}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════ CONTENT SECTIONS (Requirements, Overview, etc.) ═══════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/40" />
                <p className="section-label">{"// Enlistment"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                {unit.joinHeading}
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mt-6" />
            </div>
          </FadeIn>

          <div className="max-w-4xl mx-auto space-y-8">
            {unit.contentSections.map((section, i) => (
              <FadeIn key={section.title} delay={i * 100}>
                <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-700/40 rounded-lg overflow-hidden hover:border-accent/40 hover:shadow-[0_0_25px_rgba(var(--accent-color),0.06)] transition-all duration-500">
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800">
                    <span className="text-accent font-mono text-sm tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-4 w-px bg-zinc-700" />
                    <h3 className="text-xl font-bold uppercase tracking-wide">
                      {section.title}
                    </h3>
                  </div>
                  <div className="px-6 py-5 border-l-2 border-accent/30 mx-4 my-3 rounded-sm">
                    <div className="text-zinc-300 leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

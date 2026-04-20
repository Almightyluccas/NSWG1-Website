import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/fade-in";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InfoCard } from "@/components/ui/info-card";
import { getUnit, getAllUnitSlugs } from "@/data/unit-data";
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
                <p className="section-label">{"Specializations"}</p>
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
                <p className="section-label">{"Selection Process"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
                Pipeline
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mt-6" />
            </div>
          </FadeIn>

          <div className="max-w-5xl mx-auto relative">
            {/* Center vertical connector line (hidden on mobile, visible on md+) */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent transform -translate-x-1/2" />

            <div className="space-y-6 md:space-y-12">
              {/* START marker */}
              <FadeIn direction="up">
                <div className="flex justify-center mb-8 relative z-10 hidden md:flex">
                  <div className="bg-zinc-950 px-4 py-1 border border-accent/40 rounded-sm shadow-[0_0_15px_rgba(var(--accent-color),0.2)]">
                    <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase font-semibold">
                      [ INITIATION ]
                    </span>
                  </div>
                </div>
              </FadeIn>

              {unit.pipelineSteps.map((step, i) => {
                const padded = String(i + 1).padStart(2, "0");
                const isLast = i === unit.pipelineSteps.length - 1;
                const isEven = i % 2 === 0; // true for left side, false for right side

                return (
                  <FadeIn
                    key={step}
                    delay={i * 150}
                    direction={isEven ? "right" : "left"} // Opposite direction to animate inwards
                  >
                    <div className="group relative z-10">
                      {/* Mobile Layout (Stacked) */}
                      <div className="md:hidden flex items-stretch gap-4 border-l-2 border-accent/40 pl-4 py-2 relative">
                        {/* Connecting dot for mobile */}
                        <div className="absolute left-[-5px] top-6 w-2 h-2 rounded-full bg-accent" />
                        
                        <div
                          className={`flex-1 rounded-sm p-5 border-l-4 transition-all duration-300 ${
                            isLast
                              ? "bg-accent/10 border-accent shadow-[0_0_15px_rgba(var(--accent-color),0.1)]"
                              : "bg-zinc-900 border-zinc-700 active:border-accent"
                          }`}
                        >
                          <span className="text-accent font-mono text-[10px] tracking-widest uppercase block mb-1">
                            {`PHASE_${padded}`}
                          </span>
                          <h4
                            className={`text-base font-bold uppercase tracking-wide ${
                              isLast ? "text-accent" : "text-zinc-200"
                            }`}
                          >
                            {step}
                          </h4>
                        </div>
                      </div>

                      {/* Desktop Layout (Alternating) */}
                      <div className="hidden md:flex items-center justify-center w-full relative">
                        
                        {/* Left Side Content */}
                        <div className={`w-1/2 pr-12 flex ${isEven ? 'justify-end' : 'justify-end opacity-0 pointer-events-none'}`}>
                          {isEven && (
                            <div className={`relative overflow-hidden group w-full max-w-sm transition-all duration-500 hover:-translate-x-2 ${
                              isLast ? 'bg-accent/5' : 'bg-zinc-900/60'
                            }`}>
                              {/* Background scanline effect */}
                              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                              
                              {/* Content box with tech borders */}
                              <div className={`relative p-6 border transition-colors duration-300 ${
                                isLast ? 'border-accent/60 shadow-[0_0_20px_rgba(var(--accent-color),0.15)]' : 'border-zinc-700/60 group-hover:border-accent/40'
                              }`}
                              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                                
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-accent font-mono text-xs tracking-widest">
                                    [ PHASE {padded} ]
                                  </span>
                                  {isLast ? (
                                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                  ) : (
                                    <span className="text-zinc-600 font-mono text-[10px]">{'>>'}</span>
                                  )}
                                </div>
                                <h4 className={`text-xl font-bold uppercase tracking-wide mt-2 ${
                                  isLast ? 'text-accent' : 'text-zinc-100 group-hover:text-white'
                                }`}>
                                  {step}
                                </h4>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Center Node (Diamond) */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
                          <div className={`w-8 h-8 rotate-45 border-2 flex items-center justify-center transition-all duration-500 ${
                            isLast 
                              ? 'bg-accent border-accent shadow-[0_0_20px_rgba(var(--accent-color),0.5)]' 
                              : 'bg-zinc-900 border-zinc-500 group-hover:border-accent group-hover:bg-accent/20'
                          }`}>
                            <div className={`w-2 h-2 bg-zinc-900 transition-colors duration-500 ${isLast ? 'bg-zinc-950' : 'group-hover:bg-accent'}`} />
                          </div>
                          {/* Horizontal connector line to card */}
                          <div className={`absolute top-1/2 w-12 h-px -z-10 bg-gradient-to-${isEven ? 'l' : 'r'} from-accent/50 to-transparent ${
                            isEven ? 'right-full' : 'left-full'
                          }`} />
                        </div>

                        {/* Right Side Content */}
                        <div className={`w-1/2 pl-12 flex ${!isEven ? 'justify-start' : 'justify-start opacity-0 pointer-events-none'}`}>
                          {!isEven && (
                            <div className={`relative overflow-hidden group w-full max-w-sm transition-all duration-500 hover:translate-x-2 ${
                              isLast ? 'bg-accent/5' : 'bg-zinc-900/60'
                            }`}>
                              {/* Background scanline effect */}
                              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                              
                              {/* Content box with tech borders */}
                              <div className={`relative p-6 border transition-colors duration-300 ${
                                isLast ? 'border-accent/60 shadow-[0_0_20px_rgba(var(--accent-color),0.15)]' : 'border-zinc-700/60 group-hover:border-accent/40'
                              }`}
                              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                                
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-accent font-mono text-xs tracking-widest">
                                    [ PHASE {padded} ]
                                  </span>
                                  {isLast ? (
                                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                  ) : (
                                    <span className="text-zinc-600 font-mono text-[10px]">{'>>'}</span>
                                  )}
                                </div>
                                <h4 className={`text-xl font-bold uppercase tracking-wide mt-2 ${
                                  isLast ? 'text-accent' : 'text-zinc-100 group-hover:text-white'
                                }`}>
                                  {step}
                                </h4>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </FadeIn>
                );
              })}

              {/* END marker */}
              <FadeIn delay={unit.pipelineSteps.length * 150} direction="up">
                 <div className="flex justify-center mt-8 relative z-10 hidden md:flex">
                  <div className="bg-zinc-950 px-6 py-2 border-x-2 border-accent shadow-[0_0_20px_rgba(var(--accent-color),0.3)] backdrop-blur-sm">
                    <span className="text-accent font-mono text-xs tracking-[0.4em] uppercase font-bold">
                      OPERATIONAL STATUS ACHIEVED 
                    </span>
                  </div>
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
                <p className="section-label">{"Unit Overview"}</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/40" />
              </div>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {unit.infoCards.map((card, i) => (
              <InfoCard
                key={card.title}
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
                <p className="section-label">{"Enlistment"}</p>
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

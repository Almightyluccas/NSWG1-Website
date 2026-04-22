import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { FadeIn } from "@/components/ui/fade-in";
import GalleryContentClient from "@/app/(marketing)/gallery/gallery-content.client";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="relative pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10"></div>
          <Image
            src="/images/tacdev/tacdev-night-boat-raid.png"
            alt="Gallery"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container mx-auto px-4 z-10 relative py-20">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4">
              Operation <span className="text-accent">Gallery</span>
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Explore our collection of mission photos, training exercises, and
              team operations.
            </p>
          </FadeIn>
        </div>
      </section>

      <GalleryContentClient />
    </main>
  );
}

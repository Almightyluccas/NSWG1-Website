import type React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: string;
  content: string;
  image: string;
  className?: string;
  delay?: number;
}

export function InfoCard({
  title,
  content,
  image,
  className,
  delay = 0,
}: InfoCardProps) {
  return (
    <FadeIn delay={delay}>
      <div
        className={cn(
          "bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/40 rounded-lg overflow-hidden transition-all duration-500 group hover:border-accent/40 hover:shadow-[0_0_25px_rgba(var(--accent-color),0.08)]",
          className
        )}
      >
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
        </div>
        <div className="p-6 border-l-2 border-accent/30">
          <div className="flex items-center mb-4">
            <h3 className="text-2xl font-bold uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <p className="text-zinc-400 leading-relaxed">{content}</p>
        </div>
      </div>
    </FadeIn>
  );
}

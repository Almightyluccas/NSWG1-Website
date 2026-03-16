import type React from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  description: string;
  className?: string;
}

export function StatCard({
  icon,
  number,
  label,
  description,
  className,
}: StatCardProps) {
  return (
    <FadeIn>
      <div
        className={cn(
          "relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-8 hover:border-accent/40 transition-all duration-300 accent-border-top overflow-hidden",
          className
        )}
      >
        <div className="absolute inset-0 scan-lines pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-zinc-800/80 p-4 rounded-full mb-5 border border-zinc-700/30">
            {icon}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-accent mb-2 leading-tight">
            {number}
          </div>
          <div className="text-sm font-semibold uppercase tracking-widest text-zinc-300 mb-3">
            {label}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            {description}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

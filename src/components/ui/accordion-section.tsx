"use client";

import type React from "react";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  content: React.ReactNode;
  delay?: number;
  index?: number;
}

export function AccordionSection({
  title,
  content,
  delay = 0,
  index = 0,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const padded = String(index + 1).padStart(2, "0");

  return (
    <FadeIn delay={delay}>
      <div
        className={cn(
          "rounded-lg overflow-hidden transition-all duration-500",
          isOpen
            ? "border border-accent/40 shadow-[0_0_20px_rgba(var(--accent-color),0.08)]"
            : "border border-zinc-700/50"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-5 flex items-center justify-between text-left transition-all duration-300",
            isOpen
              ? "bg-zinc-800/80 border-b border-accent/30"
              : "bg-zinc-800/50 hover:bg-zinc-800"
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-accent/60 font-mono text-sm tracking-wider">
              {padded}
            </span>
            <h3 className="text-xl font-bold uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-accent transition-transform duration-300",
              isOpen && "transform rotate-180"
            )}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-6 bg-zinc-900/50 backdrop-blur-sm border-l-2 border-accent/30 ml-5 mr-5 my-4 rounded">
            <div className="text-zinc-300">{content}</div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

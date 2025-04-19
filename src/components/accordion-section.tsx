"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { cn } from "@/lib/utils"

interface AccordionSectionProps {
  title: string
  content: React.ReactNode
  delay?: number
}

export function AccordionSection({ title, content, delay = 0 }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FadeIn delay={delay}>
      <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-5 flex items-center justify-between text-left bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200",
            isOpen && "border-b border-zinc-700/50",
          )}
        >
          <h3 className="text-xl font-bold">{title}</h3>
          <ChevronDown
            className={cn("h-5 w-5 text-accent transition-transform duration-300", isOpen && "transform rotate-180")}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 bg-zinc-800/30 backdrop-blur-sm",
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="p-5">{content}</div>
        </div>
      </div>
    </FadeIn>
  )
}

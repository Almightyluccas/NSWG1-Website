import type React from "react"
import { FadeIn } from "@/components/ui/fade-in"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: React.ReactNode
  number: string
  label: string
  description: string
  className?: string
}

export function StatCard({ icon, number, label, description, className }: StatCardProps) {
  return (
    <FadeIn>
      <div
        className={cn(
          "bg-white dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 rounded-lg p-8 hover:border-accent/30 transition-all duration-300 shadow-sm",
          className,
        )}
      >
        <div className="flex items-start">
          <div className="bg-gray-100 dark:bg-zinc-900/80 p-3 rounded-lg mr-4">{icon}</div>
          <div>
            <div className="text-4xl font-bold text-accent mb-1">{number}</div>
            <div className="text-xl font-medium mb-2">{label}</div>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

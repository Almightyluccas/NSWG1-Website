import type React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function AdminStatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          {description && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium flex items-center",
                  trend.isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-lg">{icon}</div>
      </div>
    </div>
  )
}

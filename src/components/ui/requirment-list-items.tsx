import type React from "react";

interface RequirementItemProps {
  children: React.ReactNode
}

export function RequirementItem({ children }: RequirementItemProps) {
  return (
    <li className="flex items-start">
      <div className="bg-accent rounded-full p-1 mr-4 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-lg text-gray-700 dark:text-zinc-200">{children}</span>
    </li>
  )
}
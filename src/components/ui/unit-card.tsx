"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FadeIn } from "@/components/ui/fade-in"
import { ChevronRight } from "lucide-react"

interface UnitCardProps {
  image: string
  title: string
  description: string
  backgroundImage: string
  href: string
  delay?: number
  className?: string
  backgroundPosition?: string
  backgroundStyle?: React.CSSProperties
}

export function UnitCard({
  image,
  title,
  description,
  backgroundImage,
  href,
  delay = 0,
  className = "",
  backgroundPosition = "center",
  backgroundStyle = {}
}: UnitCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
      <FadeIn delay={delay} className={className}>
        <Link
            href={href}
            className="block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-[500px] rounded-lg overflow-hidden group transition-all duration-500">
            <div
                className="absolute inset-0 bg-cover transition-transform duration-700"
                style={{
                  backgroundImage: `url('${backgroundImage}')`,
                  backgroundPosition,
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  ...backgroundStyle
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('/grain.png')] mix-blend-overlay"></div>

            <div className="absolute inset-0 flex flex-col p-8 z-10">
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-48 h-48 mb-4">
                  <Image
                      src={image || "/placeholder.svg"}
                      alt={title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 192px"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur-sm p-6 rounded-lg transform transition-all duration-500">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{description}</p>
                <div className="flex items-center text-accent text-sm font-medium">
                  <span>Learn more</span>
                  <ChevronRight
                      className={`ml-1 h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </FadeIn>
  )
}
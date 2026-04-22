"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { ChevronRight } from "lucide-react";

interface UnitCardProps {
  image: string;
  title: string;
  description: string;
  backgroundImage: string;
  href: string;
  delay?: number;
  className?: string;
  backgroundPosition?: string;
  backgroundStyle?: React.CSSProperties;
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
  backgroundStyle = {},
}: UnitCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <FadeIn delay={delay} className={className}>
      <Link
        href={href}
        className="block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Outer glow wrapper */}
        <div
          className="relative rounded-lg transition-all duration-700"
          style={{
            boxShadow: isHovered
              ? "0 0 40px rgba(var(--accent-color), 0.25), 0 0 80px rgba(var(--accent-color), 0.1)"
              : "0 0 0px rgba(var(--accent-color), 0)",
          }}
        >
          {/* Accent border - full border that intensifies on hover */}
          <div
            className="absolute inset-0 rounded-lg z-20 pointer-events-none transition-all duration-500"
            style={{
              border: isHovered
                ? "2px solid rgba(var(--accent-color), 0.7)"
                : "1px solid rgba(var(--accent-color), 0.25)",
            }}
          />

          <div className="relative h-[650px] rounded-lg overflow-hidden">
            {/* Background image with zoom */}
            <div
              className="absolute inset-0 bg-cover transition-transform duration-[1200ms] ease-out"
              style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundPosition,
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                ...backgroundStyle,
              }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                background: `radial-gradient(ellipse at center bottom, rgba(var(--accent-color), 0.08) 0%, transparent 70%)`,
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col p-8 z-10">
              {/* Emblem */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="relative w-52 h-52 transition-all duration-700"
                  style={{
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    filter: isHovered
                      ? "drop-shadow(0 0 20px rgba(var(--accent-color), 0.3))"
                      : "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                  }}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 208px"
                  />
                </div>
              </div>

              {/* Info panel */}
              <div
                className="backdrop-blur-lg p-6 rounded-lg transition-all duration-500"
                style={{
                  background: isHovered
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(0, 0, 0, 0.5)",
                  borderLeft: isHovered
                    ? "3px solid rgba(var(--accent-color), 0.8)"
                    : "3px solid rgba(var(--accent-color), 0.3)",
                }}
              >
                <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase tracking-wide transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  {description}
                </p>
                <div className="flex items-center text-accent text-sm font-semibold uppercase tracking-widest">
                  <span>Learn more</span>
                  <ChevronRight
                    className={`ml-1 h-4 w-4 transition-all duration-300 ${isHovered ? "translate-x-2" : ""}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

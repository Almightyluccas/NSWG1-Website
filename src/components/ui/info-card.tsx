import type React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  image: string;
  className?: string;
  delay?: number;
}

export function InfoCard({
  icon,
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
          "bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg overflow-hidden hover:border-accent/30 transition-all duration-300",
          className
        )}
      >
        <div className="relative h-64">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-zinc-900/80 p-3 rounded-lg mr-4">{icon}</div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
          <p className="text-zinc-300">{content}</p>
        </div>
      </div>
    </FadeIn>
  );
}

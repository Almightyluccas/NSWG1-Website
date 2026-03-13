"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !imageRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const progressThroughViewport =
        (window.innerHeight / 2 - containerRect.top) /
        (window.innerHeight + containerRect.height);

      const translateY = -20 + progressThroughViewport * 40 * speed;

      imageRef.current.style.transform = `translateY(${translateY}%)`;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[140%] transition-transform duration-100"
        style={{ top: "-20%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${className}`}
          priority
        />
      </div>
    </div>
  );
}

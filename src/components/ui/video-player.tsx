"use client";

import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Show controls when hovering or when paused
  const showControls = isHovering || !isPlaying;

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        playsInline
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause Button - Only visible when hovering or paused */}
      <div
        className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={togglePlay}
          className="w-20 h-20 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-all duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-black" />
            ) : (
              <Play className="w-6 h-6 text-black ml-1" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

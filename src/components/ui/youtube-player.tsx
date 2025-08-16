"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

interface YouTubePlayerProps {
    videoId: string
    thumbnail?: string
    className?: string
    title?: string
}

export function YouTubePlayer({ videoId, thumbnail, className = "", title = "YouTube video" }: YouTubePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlay = () => {
        setIsPlaying(true)
    }

    return (
        <div className={`relative aspect-video overflow-hidden rounded-lg ${className}`}>
            {!isPlaying ? (
                <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                    {thumbnail ? (
                        <Image src={thumbnail || "/placeholder.svg"} alt={title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <svg className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                            </svg>
                        </div>
                    )}
                    <button
                        onClick={handlePlay}
                        className="absolute inset-0 flex items-center justify-center z-20 group"
                        aria-label="Play video"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center cursor-pointer group-hover:bg-red-500/30 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>
                    </button>
                </>
            ) : (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                ></iframe>
            )}
        </div>
    )
}

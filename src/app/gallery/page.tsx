"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { FadeIn } from "@/components/fade-in"
import { Button } from "@/components/ui/button"
import { Search, Filter, ImageIcon, Film } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { VideoPlayer } from "@/components/video-player"
// Import the YouTube player component
import { YouTubePlayer } from "@/components/youtube-player"

// Update the MediaType to include YouTube videos
type MediaType = "image" | "video" | "youtube"

// Update the GalleryItem interface to include videoType and videoId
interface GalleryItem {
    id: number
    title: string
    category: string
    unit: string[]
    type: MediaType
    src: string
    thumbnail?: string
    videoType?: "local" | "youtube"
    videoId?: string // For YouTube videos
    description: string
}

// Update the mock gallery data to include YouTube videos
const galleryItems: GalleryItem[] = [
    {
        id: 1,
        title: "Night Operation",
        category: "training",
        unit: ["tacdevron2"],
        type: "image",
        src: "/images/hero-background.png",
        description: "Tactical training exercise",
    },
    {
        id: 2,
        title: "Maritime Training",
        category: "operations",
        unit: ["tacdevron2"],
        type: "image",
        src: "/images/tacdev/tacdev-boat-night.png",
        description: "TACDEVRON2 maritime training exercise",
    },
    {
        id: 3,
        title: "We Clear The Way",
        category: "operations",
        unit: ["tacdevron2"],
        type: "youtube",
        videoId: "PDeup_aDRK0", // Example YouTube video ID
        thumbnail: "/images/tacdev/tacdev-we-clear-the-way-image.png",
        description: "Special forces operation compilation",
        src: "https://youtu.be/PDeup_aDRK0?si=eQkdDU1vzo9mxPf6"
    },
    {
        id: 4,
        title: "Tactical Exercise",
        category: "training",
        unit: ["tf160th", "tacdevron2"],
        type: "image",
        src: "/images/160th/160th-blue-birdie-full-boat.png",
        description: "Night Stalkers conducting a day operation",
    },
    {
        id: 5,
        title: "Maritime Training",
        category: "training",
        unit: ["tacdevron2"],
        type: "image",
        src: "/images/tacdev/tacdev-night-raid-boat-ladder.png",
        description: "Special forces Training Boat Infiltration",
    },
    {
        id: 6,
        title: "idk what to call this",
        category: "operations",
        unit: ["tf160th", "tacdevron2"],
        type: "video",
        videoType: "local",
        src: "/videos/160th-edit.mp4",
        thumbnail: "/images/tacdev/tacdev-interagation-vid-banner.png",
        description: "TACDEVRON2 and 160th Operation",
    },

]

type Category = "all" | "operations" | "training" | "briefing"
type Unit = "all" | "tf160th" | "tacdevron2"

export default function GalleryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<Category>("all")
    const [selectedUnit, setSelectedUnit] = useState<Unit>("all")
    const [selectedMediaType, setSelectedMediaType] = useState<"all" | MediaType>("all")
    const [selectedItem, setSelectedItem] = useState<number | null>(null)

    const filteredGallery = galleryItems.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
        const matchesUnit = selectedUnit === "all" || item.unit.includes(selectedUnit)
        const matchesMediaType = selectedMediaType === "all" || item.type === selectedMediaType

        return matchesSearch && matchesCategory && matchesUnit && matchesMediaType
    })

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10"></div>
                    <Image src="/images/tacdev/tacdev-night-boat-raid.png" alt="Gallery" fill className="object-cover" />
                </div>

                <div className="container mx-auto px-4 z-10 relative py-20">
                    <FadeIn>
                        <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4">
                            Operation <span className="text-accent">Gallery</span>
                        </h1>
                        <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
                            Explore our collection of mission photos, training exercises, and team operations.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 bg-white dark:bg-zinc-800 shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-auto flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search gallery..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="text-gray-500 dark:text-zinc-400 h-4 w-4" />
                                <span className="text-sm font-medium">Category:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
                                    All
                                </FilterButton>
                                <FilterButton
                                    active={selectedCategory === "operations"}
                                    onClick={() => setSelectedCategory("operations")}
                                >
                                    Operations
                                </FilterButton>
                                <FilterButton active={selectedCategory === "training"} onClick={() => setSelectedCategory("training")}>
                                    Training
                                </FilterButton>
                                <FilterButton active={selectedCategory === "briefing"} onClick={() => setSelectedCategory("briefing")}>
                                    Briefing
                                </FilterButton>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="text-gray-500 dark:text-zinc-400 h-4 w-4" />
                                <span className="text-sm font-medium">Unit:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton active={selectedUnit === "all"} onClick={() => setSelectedUnit("all")}>
                                    All
                                </FilterButton>
                                <FilterButton active={selectedUnit === "tf160th"} onClick={() => setSelectedUnit("tf160th")}>
                                    Task Force 160th
                                </FilterButton>
                                <FilterButton active={selectedUnit === "tacdevron2"} onClick={() => setSelectedUnit("tacdevron2")}>
                                    TACDEVRON2
                                </FilterButton>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="text-gray-500 dark:text-zinc-400 h-4 w-4" />
                                <span className="text-sm font-medium">Media Type:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton active={selectedMediaType === "all"} onClick={() => setSelectedMediaType("all")}>
                                    All
                                </FilterButton>
                                <FilterButton active={selectedMediaType === "image"} onClick={() => setSelectedMediaType("image")}>
                                    <ImageIcon className="h-4 w-4 mr-1" /> Images
                                </FilterButton>
                                <FilterButton active={selectedMediaType === "video"} onClick={() => setSelectedMediaType("video")}>
                                    <Film className="h-4 w-4 mr-1" /> Videos
                                </FilterButton>
                                <FilterButton active={selectedMediaType === "youtube"} onClick={() => setSelectedMediaType("youtube")}>
                                    <svg className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                    YouTube
                                </FilterButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {filteredGallery.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl font-medium text-gray-500 dark:text-zinc-400">No media match your filters</h3>
                            <p className="mt-2">Try adjusting your search or filter criteria</p>
                            <Button
                                className="mt-4 bg-accent hover:bg-accent-darker text-black"
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedCategory("all")
                                    setSelectedUnit("all")
                                    setSelectedMediaType("all")
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGallery.map((item) => (
                                <FadeIn key={item.id} delay={(item.id % 5) * 100}>
                                    <div
                                        className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => setSelectedItem(item.id)}
                                    >
                                        {/* Update the gallery grid item rendering to use the YouTubePlayer component */}
                                        <div className="relative h-64">
                                            {(() => {
                                                if (item.type === "image") {
                                                    return (
                                                        <Image
                                                            src={item.src || "/placeholder.svg"}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )
                                                } else if (item.type === "video") {
                                                    return (
                                                        <div className="relative h-full w-full">
                                                            <Image
                                                                src={item.thumbnail || "/placeholder.svg"}
                                                                alt={item.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-black/50 rounded-full p-3">
                                                                    <Film className="h-8 w-8 text-white" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                } else if (item.type === "youtube") {
                                                    return (
                                                        <div className="relative h-full w-full">
                                                            <Image
                                                                src={item.thumbnail || "/placeholder.svg"}
                                                                alt={item.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-black/50 rounded-full p-3">
                                                                    <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-bold">{item.title}</h3>
                                                {item.type === "video" && <Film className="h-4 w-4 text-accent" />}
                                                {item.type === "youtube" && (
                                                    <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-gray-500 dark:text-zinc-400 text-sm">{item.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold">
                                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                </span>
                                                {item.unit.map((unit) => (
                                                    <span
                                                        key={unit}
                                                        className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold"
                                                    >
            {unit === "tf160th" ? "Task Force 160th" : "TACDEVRON2"}
        </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Media Modal */}
            {selectedItem !== null && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative w-full max-h-[90vh] max-w-3xl bg-white dark:bg-zinc-800 rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-20"
                            onClick={() => setSelectedItem(null)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {galleryItems.find((item) => item.id === selectedItem) && (
                            <>
                                <div className="relative aspect-video">
                                    {(() => {
                                        const item = galleryItems.find((item) => item.id === selectedItem)!

                                        if (item.type === "image") {
                                            return (
                                                <Image
                                                    src={item.src || "/placeholder.svg"}
                                                    alt={item.title}
                                                    fill
                                                    className="object-contain"
                                                />
                                            )
                                        } else if (item.type === "video") {
                                            return <VideoPlayer src={item.src} poster={item.thumbnail} className="w-full h-full" />
                                        } else if (item.type === "youtube" && item.videoId) {
                                            return (
                                                <YouTubePlayer
                                                    videoId={item.videoId}
                                                    thumbnail={item.thumbnail}
                                                    title={item.title}
                                                    className="w-full h-full"
                                                />
                                            )
                                        }
                                        return null
                                    })()}
                                </div>
                                <div className="p-4">
                                    {(() => {
                                        const item = galleryItems.find((item) => item.id === selectedItem)!
                                        return (
                                          <>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-zinc-400 mb-4">{item.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold">
                                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                </span>
                                                {item.unit.map((unit) => (
                                                    <span
                                                        key={unit}
                                                        className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold"
                                                    >
                                                    {unit === "tf160th" ? "Task Force 160th" : "TACDEVRON2"}
                                                </span>
                                                ))}
                                          </div>
                                          </>
                                        )
                                    })()}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}

interface FilterButtonProps {
    children: React.ReactNode
    active: boolean
    onClick: () => void
}

function FilterButton({ children, active, onClick }: FilterButtonProps) {
    return (
        <button
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
                active
                    ? "bg-accent text-black"
                    : "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
            }`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

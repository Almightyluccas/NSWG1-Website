"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { Search, Filter, ImageIcon, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { VideoPlayer } from "@/components/ui/video-player";
import { YouTubePlayer } from "@/components/ui/youtube-player";
import type {
  MarketingGalleryItem,
  MarketingGalleryApiResponse,
  MediaType,
} from "@/app/(marketing)/gallery/gallery-types";

type Category = "all" | "operations" | "training" | "briefing";
type Unit = "all" | "tf160th" | "tacdevron2";

export default function GalleryContentClient() {
  const [items, setItems] = useState<MarketingGalleryItem[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">(
    "loading"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedUnit, setSelectedUnit] = useState<Unit>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | MediaType>(
    "all"
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as MarketingGalleryApiResponse;
        if (!cancelled) {
          if (Array.isArray(data.items)) {
            setItems(data.items);
            setLoadState("ok");
          } else {
            setLoadState("error");
          }
        }
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGallery = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesUnit =
      selectedUnit === "all" || item.unit.includes(selectedUnit);
    const matchesMediaType =
      selectedMediaType === "all" || item.type === selectedMediaType;

    return matchesSearch && matchesCategory && matchesUnit && matchesMediaType;
  });

  if (loadState === "loading") {
    return (
      <section className="py-24 bg-white dark:bg-zinc-800">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-zinc-400">
          Loading gallery…
        </div>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="py-24 bg-white dark:bg-zinc-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-zinc-400 mb-4">
            Could not load gallery. Please try again later.
          </p>
          <Button
            className="bg-accent hover:bg-accent-darker text-black"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
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
                <FilterButton
                  active={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={selectedCategory === "operations"}
                  onClick={() => setSelectedCategory("operations")}
                >
                  Operations
                </FilterButton>
                <FilterButton
                  active={selectedCategory === "training"}
                  onClick={() => setSelectedCategory("training")}
                >
                  Training
                </FilterButton>
                <FilterButton
                  active={selectedCategory === "briefing"}
                  onClick={() => setSelectedCategory("briefing")}
                >
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
                <FilterButton
                  active={selectedUnit === "all"}
                  onClick={() => setSelectedUnit("all")}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={selectedUnit === "tf160th"}
                  onClick={() => setSelectedUnit("tf160th")}
                >
                  Task Force 160th
                </FilterButton>
                <FilterButton
                  active={selectedUnit === "tacdevron2"}
                  onClick={() => setSelectedUnit("tacdevron2")}
                >
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
                <FilterButton
                  active={selectedMediaType === "all"}
                  onClick={() => setSelectedMediaType("all")}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={selectedMediaType === "image"}
                  onClick={() => setSelectedMediaType("image")}
                >
                  <ImageIcon className="h-4 w-4 mr-1" /> Images
                </FilterButton>
                <FilterButton
                  active={selectedMediaType === "video"}
                  onClick={() => setSelectedMediaType("video")}
                >
                  <Film className="h-4 w-4 mr-1" /> Videos
                </FilterButton>
                <FilterButton
                  active={selectedMediaType === "youtube"}
                  onClick={() => setSelectedMediaType("youtube")}
                >
                  <svg
                    className="h-4 w-4 mr-1 text-red-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
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
              <h3 className="text-2xl font-medium text-gray-500 dark:text-zinc-400">
                No media match your filters
              </h3>
              <p className="mt-2">
                Try adjusting your search or filter criteria
              </p>
              <Button
                className="mt-4 bg-accent hover:bg-accent-darker text-black"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedUnit("all");
                  setSelectedMediaType("all");
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
                    <div className="relative h-64">
                      {renderGridThumb(item)}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        {item.type === "video" && (
                          <Film className="h-4 w-4 text-accent" />
                        )}
                        {item.type === "youtube" && (
                          <svg
                            className="h-4 w-4 text-red-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold">
                          {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                        </span>
                        {item.unit.map((unit) => (
                          <span
                            key={unit}
                            className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold"
                          >
                            {unit === "tf160th"
                              ? "Task Force 160th"
                              : "TACDEVRON2"}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {items.find((item) => item.id === selectedItem) && (
              <>
                <div className="relative aspect-video">
                  {renderModalMedia(
                    items.find((item) => item.id === selectedItem)!
                  )}
                </div>
                <div className="p-4">
                  {(() => {
                    const item = items.find((i) => i.id === selectedItem)!;
                    return (
                      <>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 mb-4">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {item.category.charAt(0).toUpperCase() +
                              item.category.slice(1)}
                          </span>
                          {item.unit.map((unit) => (
                            <span
                              key={unit}
                              className="inline-block bg-gray-100 dark:bg-zinc-700 rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              {unit === "tf160th"
                                ? "Task Force 160th"
                                : "TACDEVRON2"}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function renderGridThumb(item: MarketingGalleryItem) {
  if (item.type === "image") {
    return (
      <Image
        src={item.src || "/placeholder.svg"}
        alt={item.title}
        fill
        className="object-cover"
      />
    );
  }
  if (item.type === "video") {
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
    );
  }
  if (item.type === "youtube") {
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
            <svg
              className="h-8 w-8 text-red-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function renderModalMedia(item: MarketingGalleryItem) {
  if (item.type === "image") {
    return (
      <Image
        src={item.src || "/placeholder.svg"}
        alt={item.title}
        fill
        className="object-contain"
      />
    );
  }
  if (item.type === "video") {
    return (
      <VideoPlayer
        src={item.src}
        poster={item.thumbnail}
        className="w-full h-full"
      />
    );
  }
  if (item.type === "youtube" && item.videoId) {
    return (
      <YouTubePlayer
        videoId={item.videoId}
        thumbnail={item.thumbnail}
        title={item.title}
        className="w-full h-full"
      />
    );
  }
  return null;
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
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
  );
}

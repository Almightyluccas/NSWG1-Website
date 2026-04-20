import { NextResponse } from "next/server";
import type { MarketingGalleryItem } from "@/app/(marketing)/gallery/gallery-types";

const mockGalleryItems: MarketingGalleryItem[] = [
  {
    id: 1,
    title: "Night Operation",
    category: "training",
    unit: ["tacdevron2"],
    type: "image",
    src: "/images/tacdev/default.png",
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
    videoId: "PDeup_aDRK0",
    thumbnail: "/images/tacdev/tacdev-we-clear-the-way-image.png",
    description: "Special forces operation compilation",
    src: "https://youtu.be/PDeup_aDRK0?si=eQkdDU1vzo9mxPf6",
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
    title: "NSWG1 compilation",
    category: "operations",
    unit: ["tf160th", "tacdevron2"],
    type: "video",
    videoType: "local",
    src: "/videos/160th-edit.mp4",
    thumbnail: "/images/tacdev/tacdev-interagation-vid-banner.png",
    description: "TACDEVRON2 and 160th Operation",
  },
];

export async function GET() {
  return NextResponse.json({ items: mockGalleryItems });
}

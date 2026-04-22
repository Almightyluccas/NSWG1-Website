import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import type { MarketingGalleryItem } from "@/app/(marketing)/gallery/gallery-types";

const LEGACY_MARKETING_ITEMS: MarketingGalleryItem[] = [
  {
    id: -1,
    title: "Night Boat Raid",
    category: "operations",
    unit: ["tacdevron2"],
    type: "image",
    src: "/images/tacdev/tacdev-night-boat-raid.png",
    description: "Legacy showcase image from TACDEVRON2 maritime operations.",
  },
  {
    id: -2,
    title: "Operator Roster Brief",
    category: "briefing",
    unit: ["tf160th", "tacdevron2"],
    type: "image",
    src: "/images/tacdev/default.png",
    description: "Legacy briefing card retained for the public gallery.",
  },
  {
    id: -3,
    title: "Training Evolution",
    category: "training",
    unit: ["tf160th"],
    type: "image",
    src: "/images/tacdev/default.png",
    description: "Legacy training media retained for continuity.",
  },
];

export async function GET() {
  try {
    const dbItems = await database.get.galleryMarketingItems();
    const seen = new Set(dbItems.map((item) => `${item.title}|${item.src}`));
    const merged = [
      ...LEGACY_MARKETING_ITEMS.filter(
        (item) => !seen.has(`${item.title}|${item.src}`)
      ),
      ...dbItems,
    ];
    return NextResponse.json({ items: merged });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery", items: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const mediaType = body.mediaType ?? body.type;
    if (!title || !["image", "video", "youtube"].includes(String(mediaType))) {
      return NextResponse.json(
        { error: "title and mediaType (image|video|youtube) are required" },
        { status: 400 }
      );
    }

    const src = String(body.src ?? "").trim();
    if (!src) {
      return NextResponse.json({ error: "src is required" }, { status: 400 });
    }

    const category = String(body.category ?? "training").trim() || "training";
    const units = Array.isArray(body.unit)
      ? body.unit.map((u: unknown) => String(u).trim()).filter(Boolean)
      : typeof body.unit === "string"
        ? [body.unit.trim()].filter(Boolean)
        : [];

    const id = await database.post.galleryMedia({
      title,
      description: String(body.description ?? ""),
      mediaType: mediaType as "image" | "video" | "youtube",
      src,
      thumbnail: body.thumbnail != null ? String(body.thumbnail) : null,
      videoId: body.videoId != null ? String(body.videoId) : null,
      category,
      units: units.length ? units : ["tacdevron2"],
      createdBy: session.user.id ?? null,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}

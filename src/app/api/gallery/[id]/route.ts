import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (Number.isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const patch: {
      title?: string;
      description?: string | null;
      mediaType?: "image" | "video" | "youtube";
      src?: string;
      thumbnail?: string | null;
      videoId?: string | null;
      category?: string;
      units?: string[];
    } = {};

    if (body.title !== undefined) patch.title = String(body.title);
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.mediaType !== undefined || body.type !== undefined) {
      const mt = body.mediaType ?? body.type;
      if (!["image", "video", "youtube"].includes(String(mt))) {
        return NextResponse.json({ error: "Invalid mediaType" }, { status: 400 });
      }
      patch.mediaType = mt as "image" | "video" | "youtube";
    }
    if (body.src !== undefined) patch.src = String(body.src);
    if (body.thumbnail !== undefined) patch.thumbnail = body.thumbnail;
    if (body.videoId !== undefined) patch.videoId = body.videoId;
    if (body.category !== undefined) patch.category = String(body.category);
    if (body.unit !== undefined) {
      patch.units = Array.isArray(body.unit)
        ? body.unit.map((u: unknown) => String(u).trim()).filter(Boolean)
        : [String(body.unit).trim()].filter(Boolean);
    }

    await database.put.galleryMedia(mediaId, patch);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (Number.isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await database.delete.galleryMedia(mediaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}

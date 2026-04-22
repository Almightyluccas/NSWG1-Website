import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const orderedIds = body.orderedIds as unknown;
    if (!Array.isArray(orderedIds) || orderedIds.some((x) => typeof x !== "number" && typeof x !== "string")) {
      return NextResponse.json({ error: "orderedIds must be an array of numeric ids" }, { status: 400 });
    }

    const ids = orderedIds.map((x) => (typeof x === "number" ? x : parseInt(String(x), 10)));
    if (ids.some((n) => Number.isNaN(n))) {
      return NextResponse.json({ error: "Invalid id in orderedIds" }, { status: 400 });
    }

    await database.put.galleryMediaOrder(ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering gallery:", error);
    return NextResponse.json({ error: "Failed to reorder gallery" }, { status: 500 });
  }
}

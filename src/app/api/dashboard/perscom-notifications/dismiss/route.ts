import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id) || id < 1) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const allowed = await database.get.perscomNotificationBelongsToUser(
      id,
      session.user.id
    );
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await database.post.perscomNotificationDismissal(id, session.user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error dismissing perscom notification:", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}

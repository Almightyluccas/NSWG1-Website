import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";

const db = DatabaseClient.getInstance();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: missionId } = await params;

  if (!missionId) {
    return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();
    
    if (!["attending", "not-attending", "maybe"].includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rsvpId = `rsvp-${missionId}-${session.user.id}`;

    await db.post.missionRSVP({
      id: rsvpId,
      missionId,
      userId: session.user.id!,
      userName: session.user.name || session.user.email || "Unknown",
      status: data.status,
      notes: data.notes,
    });

    return NextResponse.json({ success: true, id: rsvpId });
  } catch (error) {
    console.error(`POST /api/missions/${missionId}/rsvp error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

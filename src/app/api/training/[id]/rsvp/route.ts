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

  const { id: trainingId } = await params;

  if (!trainingId) {
    return NextResponse.json({ error: "Training ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();
    
    if (!["attending", "not-attending", "maybe"].includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const allowed = await db.get.canUserAccessTraining(
      trainingId,
      session.user.id!,
      session.user.roles ?? []
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "You are not allowed to RSVP for this training" },
        { status: 403 }
      );
    }

    const rsvpId = `trsvp-${trainingId}-${session.user.id}`;

    await db.post.trainingRSVP({
      id: rsvpId,
      trainingId,
      userId: session.user.id!,
      userName: session.user.name || session.user.email || "Unknown",
      status: data.status,
      notes: data.notes,
    });

    return NextResponse.json({ success: true, id: rsvpId });
  } catch (error) {
    console.error(`POST /api/training/${trainingId}/rsvp error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

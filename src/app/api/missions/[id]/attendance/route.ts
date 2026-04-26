import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: missionId } = await params;

  if (!missionId) {
    return NextResponse.json(
      { error: "Mission ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    if (!data.userId || !data.userName || !data.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["present", "absent", "late", "excused"].includes(data.status)) {
      return NextResponse.json(
        { error: "Invalid attendance status" },
        { status: 400 }
      );
    }

    const attendanceId = `att-${missionId}-${data.userId}`;

    await db.post.missionAttendance({
      id: attendanceId,
      missionId,
      userId: data.userId,
      userName: data.userName,
      status: data.status,
      notes: data.notes,
      markedBy: session.user.id!,
    });

    return NextResponse.json({ success: true, id: attendanceId });
  } catch (error) {
    console.error(`POST /api/missions/${missionId}/attendance error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

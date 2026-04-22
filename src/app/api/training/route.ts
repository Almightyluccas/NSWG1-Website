import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { format } from "date-fns";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

function getMissionStatusFromDate(
  date: string,
  time: string,
  currentStatus: string
): string {
  const now = new Date();
  const nowString = format(now, "yyyy-MM-dd");
  const nowTime = format(now, "HH:mm");

  if (currentStatus === "cancelled") {
    return currentStatus;
  }

  if (nowString < date || (nowString === date && nowTime < time)) {
    return "scheduled";
  } else if (nowString > date || (nowString === date && nowTime > time)) {
    const [hours, minutes] = time.split(":").map(Number);
    const endHours = hours + 3;
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    if (nowString === date && nowTime < endTime) {
      return "in-progress";
    } else {
      return "completed";
    }
  } else {
    return "in-progress";
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const isAdmin = session.user.roles.includes(UserRole.admin);
    const trainingRecords = await db.get.trainingRecords(
      session.user.id,
      isAdmin
    );

    const trainingWithData = await Promise.all(
      trainingRecords.map(async (training) => {
        const newStatus = getMissionStatusFromDate(
          training.date,
          training.time,
          training.status
        );
        if (newStatus !== training.status) {
          await db.put.trainingStatus(training.id, newStatus);
          training.status = newStatus;
        }

        const rsvps = await db.get.trainingRSVPs(training.id);
        const attendance = await db.get.trainingAttendance(training.id);

        return {
          ...training,
          rsvps: rsvps.map((rsvp) => ({
            id: rsvp.id,
            trainingId: rsvp.training_id,
            userId: rsvp.user_id,
            userName: rsvp.user_name,
            status: rsvp.status,
            notes: rsvp.notes,
            createdAt: rsvp.created_at,
            updatedAt: rsvp.updated_at,
          })),
          attendance: attendance.map((att) => ({
            id: att.id,
            trainingId: att.training_id,
            userId: att.user_id,
            userName: att.user_name,
            status: att.status,
            notes: att.notes,
            markedBy: att.marked_by,
            markedAt: att.marked_at,
          })),
        };
      })
    );

    return NextResponse.json(trainingWithData);
  } catch (error) {
    console.error("GET /api/training error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.date || !data.time || !data.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trainingId = `training-${Date.now()}`;
    const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

    await db.post.trainingRecord({
      id: trainingId,
      name: data.name,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      instructor: data.instructor,
      maxPersonnel: data.maxPersonnel,
      status,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ id: trainingId });
  } catch (error) {
    console.error("POST /api/training error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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

  if (currentStatus === "cancelled") return currentStatus;

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.date || !data.time || !data.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

    await db.put.mission(id, {
      name: data.name,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      maxPersonnel: data.maxPersonnel,
    });
    
    await db.put.missionStatus(id, status);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(`PUT /api/missions/${id} error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
  }

  try {
    await db.delete.mission(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/missions/${id} error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

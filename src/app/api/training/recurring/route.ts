import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const trainings = await database.get.recurringTrainings();
    return NextResponse.json(trainings);
  } catch (error) {
    console.error("GET /api/training/recurring error:", error);
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
    const id = `recurring-training-${Date.now()}`;

    await database.post.recurringTraining({
      ...data,
      id,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST /api/training/recurring error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

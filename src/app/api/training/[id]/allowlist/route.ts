import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  const allowlist = await db.get.trainingAllowlist(id);
  return NextResponse.json(allowlist);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  await db.post.replaceTrainingAllowlist(
    id,
    Array.isArray(body.roles) ? body.roles.map(String) : [],
    Array.isArray(body.userIds) ? body.userIds.map(String) : []
  );
  return NextResponse.json({ success: true });
}

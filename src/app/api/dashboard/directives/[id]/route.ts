import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await database.put.directiveStatus(parseInt(id), body.status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating directive:", error);
    return NextResponse.json(
      { error: "Failed to update directive" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await database.delete.directive(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting directive:", error);
    return NextResponse.json(
      { error: "Failed to delete directive" },
      { status: 500 }
    );
  }
}

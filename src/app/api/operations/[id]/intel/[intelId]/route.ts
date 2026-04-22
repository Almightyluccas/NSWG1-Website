import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; intelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { intelId } = await params;
    await database.delete.operationIntel(parseInt(intelId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting operation intel:", error);
    return NextResponse.json(
      { error: "Failed to delete intel" },
      { status: 500 }
    );
  }
}

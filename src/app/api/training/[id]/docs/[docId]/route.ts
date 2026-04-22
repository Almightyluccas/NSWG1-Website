import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id, docId } = await params;
  const documentId = Number(docId);
  if (Number.isNaN(documentId)) {
    return NextResponse.json({ error: "Invalid docId" }, { status: 400 });
  }
  await db.delete.detachDocumentFromTraining(id, documentId);
  return NextResponse.json({ success: true });
}

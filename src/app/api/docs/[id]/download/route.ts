import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import objectStorageService from "@/lib/Object-Storage/ObjectStorage";
import { UserRole } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.member)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const docId = Number(id);
  if (Number.isNaN(docId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const row = await database.get.operationDocumentById(docId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const raw = String(row.file_url ?? "");
  if (!raw) {
    return NextResponse.json({ error: "Document has no file" }, { status: 404 });
  }

  if (/^https?:\/\//i.test(raw)) {
    return NextResponse.json({ url: raw });
  }

  const url = await objectStorageService.getSignedUrl(raw);
  return NextResponse.json({ url });
}

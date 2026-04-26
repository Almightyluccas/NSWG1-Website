import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import objectStorageService from "@/lib/Object-Storage/ObjectStorage";
import { canAccessDocument } from "@/lib/documents/access";
import { UserRole } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const roles = session?.user?.roles ?? [];
  if (!userId || !roles.includes(UserRole.member)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await database.get.documentById(Number(id));
  if (!row) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const allowedRoles = await database.get.documentAllowedRoles(Number(id));
  const allowedUsers = await database.get.documentAllowedUsers(Number(id));
  const allowed = canAccessDocument(
    { userId, roles },
    {
      minimumRole: row.minimum_role ?? UserRole.member,
      allowedRoles,
      allowedUsers,
    }
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = String(row.file_key ?? "");
  if (!key) {
    return NextResponse.json(
      { error: "Document key missing" },
      { status: 400 }
    );
  }

  const url = await objectStorageService.getSignedUrl(key);
  return NextResponse.json({ url });
}

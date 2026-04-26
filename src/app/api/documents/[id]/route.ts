import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { canAccessDocument } from "@/lib/documents/access";
import { UserRole } from "@/types/database";

async function mapDocument(row: any) {
  const tags = await database.get.documentTags(Number(row.id));
  const allowedRoles = await database.get.documentAllowedRoles(Number(row.id));
  const allowedUsers = await database.get.documentAllowedUsers(Number(row.id));
  return {
    id: String(row.id),
    name: row.name ?? "",
    description: row.description ?? "",
    docType: row.doc_type ?? "",
    classification: row.classification ?? "GENERAL",
    unit: row.unit ?? "NSWG1 HQ",
    fileKey: row.file_key ?? "",
    fileType: row.file_type ?? "",
    fileSize: row.file_size ? Number(row.file_size) : null,
    minimumRole: row.minimum_role ?? UserRole.member,
    tags,
    allowedRoles,
    allowedUsers,
  };
}

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
  const doc = await mapDocument(row);
  if (!canAccessDocument({ userId, roles }, doc)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(doc);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  await database.put.document(Number(id), {
    name: body.name !== undefined ? String(body.name) : undefined,
    description:
      body.description !== undefined ? String(body.description) : undefined,
    docType: body.docType !== undefined ? String(body.docType) : undefined,
    classification:
      body.classification !== undefined
        ? String(body.classification)
        : undefined,
    unit: body.unit !== undefined ? String(body.unit) : undefined,
    fileKey: body.fileKey !== undefined ? String(body.fileKey) : undefined,
    fileType: body.fileType !== undefined ? String(body.fileType) : undefined,
    fileSize: body.fileSize !== undefined ? Number(body.fileSize) : undefined,
    minimumRole:
      body.minimumRole !== undefined ? String(body.minimumRole) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    allowedRoles: Array.isArray(body.allowedRoles)
      ? body.allowedRoles.map(String)
      : undefined,
    allowedUsers: Array.isArray(body.allowedUsers)
      ? body.allowedUsers.map(String)
      : undefined,
  });
  const row = await database.get.documentById(Number(id));
  if (!row) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, item: await mapDocument(row) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await database.delete.document(Number(id));
  return NextResponse.json({ success: true });
}

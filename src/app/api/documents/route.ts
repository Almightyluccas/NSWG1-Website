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
    classification: row.classification ?? "GENERAL",
    unit: row.unit ?? "NSWG1 HQ",
    type: row.file_type ?? "FILE",
    size: row.file_size ? String(row.file_size) : "",
    lastModified:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString().slice(0, 10)
        : String(row.updated_at ?? row.created_date ?? ""),
    author: row.uploader_name ?? "System",
    docNumber: `DOC-${String(row.id).padStart(5, "0")}`,
    minimumRole: row.minimum_role ?? UserRole.member,
    tags,
    allowedRoles,
    allowedUsers,
    fileType: row.file_type ?? "",
    fileSizeBytes: row.file_size ? Number(row.file_size) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const roles = session?.user?.roles ?? [];
    if (!userId || !roles.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search") || undefined;
    const unit = request.nextUrl.searchParams.get("unit") || undefined;
    const classification =
      request.nextUrl.searchParams.get("classification") || undefined;
    const tag = request.nextUrl.searchParams.get("tag") || undefined;
    const rows = await database.get.documents({
      search,
      unit,
      classification,
      tag,
    });
    const mapped = await Promise.all(rows.map(mapDocument));
    const filtered = mapped.filter((doc) =>
      canAccessDocument(
        { userId, roles },
        {
          minimumRole: doc.minimumRole,
          allowedRoles: doc.allowedRoles ?? [],
          allowedUsers: doc.allowedUsers ?? [],
        }
      )
    );
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Failed to list documents:", error);
    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const fileKey = String(body.fileKey ?? "").trim();
    const fileType = String(body.fileType ?? "").trim();
    if (!name || !fileKey || !fileType) {
      return NextResponse.json(
        { error: "name, fileKey, and fileType are required" },
        { status: 400 }
      );
    }

    const id = await database.post.document({
      name,
      description: String(body.description ?? ""),
      docType: body.docType ? String(body.docType) : null,
      classification: String(body.classification ?? "GENERAL"),
      unit: String(body.unit ?? "NSWG1 HQ"),
      fileKey,
      fileType,
      fileSize: body.fileSize ? Number(body.fileSize) : null,
      minimumRole: String(body.minimumRole ?? UserRole.member),
      uploadedBy: session.user.id,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      allowedRoles: Array.isArray(body.allowedRoles)
        ? body.allowedRoles.map(String)
        : [],
      allowedUsers: Array.isArray(body.allowedUsers)
        ? body.allowedUsers.map(String)
        : [],
    });

    const row = await database.get.documentById(id);
    const item = row ? await mapDocument(row) : { id: String(id) };
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

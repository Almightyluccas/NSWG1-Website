import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { canAccessDocument } from "@/lib/documents/access";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

async function mapTrainingDoc(row: any) {
  return {
    id: String(row.id),
    name: row.name ?? "",
    description: row.description ?? "",
    classification: row.classification ?? "GENERAL",
    unit: row.unit ?? "NSWG1 HQ",
    fileType: row.file_type ?? "",
    fileSize: row.file_size ? Number(row.file_size) : null,
    docType: row.doc_type ?? "",
    createdAt: row.created_at,
    tags: await db.get.documentTags(Number(row.id)),
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
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: trainingId } = await params;
  const docs = await db.get.trainingDocuments(trainingId);
  const allowlisted = await db.get.canUserAccessTraining(
    trainingId,
    userId,
    roles
  );
  const rsvpStatus = await db.get.userTrainingRsvpStatus(trainingId, userId);
  const isAdmin =
    roles.includes(UserRole.admin) || roles.includes(UserRole.superAdmin);

  const visible = [];
  for (const row of docs) {
    if (isAdmin) {
      visible.push(row);
      continue;
    }

    const allowedRoles = await db.get.documentAllowedRoles(Number(row.id));
    const allowedUsers = await db.get.documentAllowedUsers(Number(row.id));
    const regularDocAccess = canAccessDocument(
      { userId, roles },
      {
        minimumRole: row.minimum_role ?? UserRole.member,
        allowedRoles,
        allowedUsers,
      }
    );
    const trainingGrant = allowlisted && rsvpStatus === "attending";
    if (regularDocAccess || trainingGrant) {
      visible.push(row);
    }
  }

  const payload = await Promise.all(visible.map(mapTrainingDoc));
  return NextResponse.json(payload);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id: trainingId } = await params;
  const body = await request.json();
  const documentId = Number(body.documentId);
  if (Number.isNaN(documentId)) {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  await db.post.attachDocumentToTraining(trainingId, documentId);
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { postAdminAlert } from "@/lib/dashboard/postAdminAlert";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const docId = parseInt(id, 10);
    if (Number.isNaN(docId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const row = await database.get.operationDocumentById(docId);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: String(row.id),
      campaignId: String(row.campaign_id),
      missionId: row.mission_id ? String(row.mission_id) : "",
      title: row.name,
      description: row.description ?? "",
      docType: row.doc_type ?? "",
      classification: row.classification ?? "",
      date: row.doc_date_fmt ?? "",
      fileUrl: row.file_url ?? "",
    });
  } catch (error) {
    console.error("Error loading planning doc:", error);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const docId = parseInt(id, 10);
    if (Number.isNaN(docId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await database.get.operationDocumentById(docId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const patch: {
      name?: string;
      description?: string;
      docType?: string | null;
      classification?: string | null;
      docDate?: string | null;
      minimumRole?: string;
    } = {};

    if (body.title !== undefined) patch.name = String(body.title);
    else if (body.name !== undefined) patch.name = String(body.name);

    if (body.description !== undefined) patch.description = String(body.description);
    if (body.docType !== undefined) patch.docType = String(body.docType);
    if (body.classification !== undefined) patch.classification = String(body.classification);
    if (body.minimumRole !== undefined) patch.minimumRole = String(body.minimumRole);

    if (body.date !== undefined) {
      patch.docDate = body.date ? String(body.date).slice(0, 10) : null;
    } else if (body.docDate !== undefined) {
      patch.docDate = body.docDate ? String(body.docDate).slice(0, 10) : null;
    }

    await database.put.operationDocument(docId, patch);
    await postAdminAlert({
      label: "DOC EDITED",
      message: `Document ${existing.name} was updated.`,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating planning doc:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const docId = parseInt(id, 10);
    if (Number.isNaN(docId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await database.get.operationDocumentById(docId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await database.delete.operationDocument(docId);
    await postAdminAlert({
      label: "DOC DELETED",
      message: `Document ${existing.name} was deleted.`,
      type: "warning",
      createdBy: session.user.id!,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting planning doc:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

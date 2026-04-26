import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { postAdminAlert } from "@/lib/dashboard/postAdminAlert";

function mapPlanningDoc(row: any) {
  return {
    id: String(row.id),
    title: row.name,
    description: row.description ?? "",
    docType: row.doc_type ?? "",
    classification: row.classification ?? "",
    fileUrl: row.file_url ?? "",
    date: row.doc_date_fmt ?? "",
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? ""),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = request.nextUrl.searchParams.get("campaignId");
    const missionId = request.nextUrl.searchParams.get("missionId");

    if (!campaignId && !missionId) {
      return NextResponse.json(
        { error: "campaignId or missionId is required" },
        { status: 400 }
      );
    }

    let rows: any[];
    if (missionId) {
      const cid = await database.get.missionCampaignId(missionId);
      if (!cid) {
        return NextResponse.json([]);
      }
      rows = await database.get.operationDocuments(cid, missionId);
    } else {
      rows = await database.get.operationDocuments(
        campaignId!,
        undefined,
        true
      );
    }

    return NextResponse.json(rows.map(mapPlanningDoc));
  } catch (error) {
    console.error("Error loading planning docs:", error);
    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    let campaignId = String(body.campaignId ?? "").trim();
    const missionId = body.missionId ? String(body.missionId).trim() : "";
    const title = String(body.title ?? "").trim();

    if ((!campaignId && !missionId) || !title) {
      return NextResponse.json(
        { error: "owner (campaignId/missionId) and title are required" },
        { status: 400 }
      );
    }

    if (!campaignId && missionId) {
      const cid = await database.get.missionCampaignId(missionId);
      if (!cid) {
        return NextResponse.json(
          { error: "Mission not found" },
          { status: 400 }
        );
      }
      campaignId = cid;
    }

    const docId = await database.post.operationDocument({
      campaignId,
      missionId: missionId || undefined,
      name: title,
      description: String(body.description ?? ""),
      docType: String(body.docType ?? "OTHER"),
      classification: String(body.classification ?? "UNCLASSIFIED"),
      docDate: body.date ? String(body.date).trim() || null : null,
      fileUrl: String(body.fileUrl ?? ""),
      fileType: String(body.fileType ?? "application/pdf"),
      fileSize: body.fileSize ? String(body.fileSize) : undefined,
      minimumRole: body.minimumRole,
      uploadedBy: session.user.id!,
    });

    const row = await database.get.operationDocumentById(docId);
    const item = row
      ? mapPlanningDoc(row)
      : {
          id: String(docId),
          title,
          description: "",
          docType: "",
          classification: "",
          fileUrl: "",
          date: "",
          createdAt: new Date().toISOString(),
        };

    await postAdminAlert({
      label: "DOC UPLOADED",
      message: `${title} uploaded${missionId ? ` and linked to mission ${missionId}` : ""}.`,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error creating planning doc:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

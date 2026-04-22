import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { postAdminAlert } from "@/lib/dashboard/postAdminAlert";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const docId = Number(id);
    if (!Number.isInteger(docId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const missionId = String(body.missionId ?? "").trim();
    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 });
    }

    const docCampaignId = await database.get.operationDocumentCampaignId(docId);
    if (!docCampaignId) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const missionCampaignId = await database.get.missionCampaignId(missionId);
    if (!missionCampaignId) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }
    if (docCampaignId !== missionCampaignId) {
      return NextResponse.json(
        { error: "Mission must belong to the same campaign as document" },
        { status: 400 }
      );
    }

    await database.post.attachDocumentToMission(docId, missionId);
    await postAdminAlert({
      label: "DOC ATTACHED TO MISSION",
      message: `Document ${docId} attached to mission ${missionId}.`,
      createdBy: session.user.id!,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error attaching document to mission:", error);
    return NextResponse.json({ error: "Failed to attach document" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const docId = Number(id);
    const missionId = String(request.nextUrl.searchParams.get("missionId") ?? "").trim();
    if (!Number.isInteger(docId) || !missionId) {
      return NextResponse.json({ error: "Invalid id or missionId" }, { status: 400 });
    }

    await database.delete.detachDocumentFromMission(docId, missionId);
    await postAdminAlert({
      label: "DOC DETACHED FROM MISSION",
      message: `Document ${docId} detached from mission ${missionId}.`,
      createdBy: session.user.id!,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error detaching document from mission:", error);
    return NextResponse.json({ error: "Failed to detach document" }, { status: 500 });
  }
}

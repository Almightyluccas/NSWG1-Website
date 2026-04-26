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
    const sseId = Number(id);
    if (!Number.isInteger(sseId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const missionId = String(body.missionId ?? "").trim();
    if (!missionId) {
      return NextResponse.json(
        { error: "missionId is required" },
        { status: 400 }
      );
    }

    const sseCampaignId = await database.get.sseItemCampaignId(sseId);
    if (!sseCampaignId) {
      return NextResponse.json(
        { error: "SSE item not found" },
        { status: 404 }
      );
    }
    const missionCampaignId = await database.get.missionCampaignId(missionId);
    if (!missionCampaignId) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }
    if (sseCampaignId !== missionCampaignId) {
      return NextResponse.json(
        { error: "Mission must belong to the same campaign as SSE item" },
        { status: 400 }
      );
    }

    await database.post.attachSseToMission(sseId, missionId);
    await postAdminAlert({
      label: "SSE ATTACHED TO MISSION",
      message: `SSE ${sseId} attached to mission ${missionId}.`,
      createdBy: session.user.id!,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error attaching SSE to mission:", error);
    return NextResponse.json(
      { error: "Failed to attach SSE" },
      { status: 500 }
    );
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
    const sseId = Number(id);
    const missionId = String(
      request.nextUrl.searchParams.get("missionId") ?? ""
    ).trim();
    if (!Number.isInteger(sseId) || !missionId) {
      return NextResponse.json(
        { error: "Invalid id or missionId" },
        { status: 400 }
      );
    }

    await database.delete.detachSseFromMission(sseId, missionId);
    await postAdminAlert({
      label: "SSE DETACHED FROM MISSION",
      message: `SSE ${sseId} detached from mission ${missionId}.`,
      createdBy: session.user.id!,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error detaching SSE from mission:", error);
    return NextResponse.json(
      { error: "Failed to detach SSE" },
      { status: 500 }
    );
  }
}

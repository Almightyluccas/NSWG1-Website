import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { mergeIntelNarrativeRows } from "@/lib/api/intel-narrative";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missionId = request.nextUrl.searchParams.get("missionId");
    if (!missionId) {
      return NextResponse.json(
        { error: "missionId is required" },
        { status: 400 }
      );
    }

    const campaignId = await database.get.missionCampaignId(missionId);
    if (!campaignId) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    const rows = await database.get.operationIntelNarrativeRows(
      campaignId,
      missionId
    );
    return NextResponse.json(
      mergeIntelNarrativeRows(rows, "missionId", missionId)
    );
  } catch (error) {
    console.error("Error loading mission intel:", error);
    return NextResponse.json(
      { error: "Failed to load intel" },
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
    const missionId = String(body.missionId ?? "").trim();
    if (!missionId) {
      return NextResponse.json(
        { error: "missionId is required" },
        { status: 400 }
      );
    }

    await database.post.operationIntelUpsertBlock({
      ownerType: "mission",
      ownerId: missionId,
      regionalIntel: String(body.regionalIntel ?? ""),
      operationalIntel: String(body.operationalIntel ?? ""),
      createdBy: session.user.id ?? "unknown",
    });

    const campaignId = await database.get.missionCampaignId(missionId);
    if (!campaignId) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    const rows = await database.get.operationIntelNarrativeRows(
      campaignId,
      missionId
    );
    const intel = mergeIntelNarrativeRows(rows, "missionId", missionId);
    return NextResponse.json({ success: true, intel });
  } catch (error) {
    console.error("Error saving mission intel:", error);
    return NextResponse.json(
      { error: "Failed to save intel" },
      { status: 500 }
    );
  }
}

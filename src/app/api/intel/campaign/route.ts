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

    const campaignId = request.nextUrl.searchParams.get("campaignId");
    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    const rows = await database.get.operationIntelNarrativeRows(
      campaignId,
      null
    );
    return NextResponse.json(
      mergeIntelNarrativeRows(rows, "campaignId", campaignId)
    );
  } catch (error) {
    console.error("Error loading campaign intel:", error);
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
    const campaignId = String(body.campaignId ?? "").trim();
    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    await database.post.operationIntelUpsertBlock({
      ownerType: "campaign",
      ownerId: campaignId,
      regionalIntel: String(body.regionalIntel ?? ""),
      operationalIntel: String(body.operationalIntel ?? ""),
      createdBy: session.user.id ?? "unknown",
    });

    const rows = await database.get.operationIntelNarrativeRows(
      campaignId,
      null
    );
    const intel = mergeIntelNarrativeRows(rows, "campaignId", campaignId);
    return NextResponse.json({ success: true, intel });
  } catch (error) {
    console.error("Error saving campaign intel:", error);
    return NextResponse.json(
      { error: "Failed to save intel" },
      { status: 500 }
    );
  }
}

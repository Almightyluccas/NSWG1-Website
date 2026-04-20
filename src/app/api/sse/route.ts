import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

type ScopedSseItem = {
  id: string;
  ownerType: "campaign" | "mission";
  ownerId: string;
  title: string;
  description: string;
  type: string;
  classification: string;
  status: string;
  imageUrl: string;
  collectedDate: string;
  createdAt: string;
  createdBy: string;
};

const scopedSseStore: ScopedSseItem[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missionId = request.nextUrl.searchParams.get("missionId");
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    const scope = request.nextUrl.searchParams.get("scope");

    if (scope === "management" || missionId) {
      if (!missionId && !campaignId) {
        return NextResponse.json(
          { error: "campaignId or missionId is required" },
          { status: 400 },
        );
      }

      const ownerType = missionId ? "mission" : "campaign";
      const ownerId = missionId ?? campaignId!;
      const items = scopedSseStore.filter(
        (item) => item.ownerType === ownerType && item.ownerId === ownerId,
      );
      return NextResponse.json(items);
    }

    const items = await database.get.sseItems(campaignId || undefined);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching SSE items:", error);
    return NextResponse.json(
      { error: "Failed to fetch SSE items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const ownerType = body.missionId ? "mission" : "campaign";
    const ownerId = String(body.missionId ?? body.campaignId ?? "").trim();
    const isScopedPayload =
      body.scope === "management" || !!body.missionId || !!body.title;

    if (isScopedPayload) {
      if (!ownerId || !String(body.title ?? "").trim()) {
        return NextResponse.json(
          { error: "owner (campaignId/missionId) and title are required" },
          { status: 400 },
        );
      }

      // TODO: Replace in-memory storage with database persistence and object storage.
      const nextItem: ScopedSseItem = {
        id: `sse-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        ownerType,
        ownerId,
        title: String(body.title ?? ""),
        description: String(body.description ?? ""),
        type: String(body.type ?? "EVIDENCE"),
        classification: String(body.classification ?? "UNCLASSIFIED"),
        status: String(body.status ?? "LOGGED"),
        imageUrl: String(body.imageUrl ?? ""),
        collectedDate: String(body.collectedDate ?? ""),
        createdAt: new Date().toISOString(),
        createdBy: session.user.id ?? "unknown",
      };

      // Keep management SSE linked to the main SSE pipeline.
      const linkedCampaignId = String(body.campaignId ?? "").trim();
      if (linkedCampaignId) {
        // TODO: When real upload/storage is implemented, store full metadata in DB.
        await database.post.sseItem({
          campaignId: linkedCampaignId,
          type: nextItem.type,
          name: nextItem.title,
          description: nextItem.description,
          status: nextItem.status,
          minimumRole: UserRole.member,
          imageUrl: nextItem.imageUrl,
          uploadedBy: session.user.id!,
        });
      }

      scopedSseStore.unshift(nextItem);
      return NextResponse.json({ success: true, item: nextItem }, { status: 201 });
    }

    const id = await database.post.sseItem({
      campaignId: body.campaignId,
      type: body.type,
      name: body.name,
      description: body.description,
      status: body.status,
      minimumRole: body.minimumRole,
      imageUrl: body.imageUrl,
      uploadedBy: session.user.id!,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating SSE item:", error);
    return NextResponse.json(
      { error: "Failed to create SSE item" },
      { status: 500 }
    );
  }
}

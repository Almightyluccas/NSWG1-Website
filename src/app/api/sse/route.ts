import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { mapSseRowForManagement } from "@/lib/api/sse-management-map";
import { postAdminAlert } from "@/lib/dashboard/postAdminAlert";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missionId = request.nextUrl.searchParams.get("missionId");
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    const scope = request.nextUrl.searchParams.get("scope");
    const uploadedBy = request.nextUrl.searchParams.get("uploadedBy");
    const status = request.nextUrl.searchParams.get("status");

    if (scope === "management" || scope === "repository" || missionId) {
      if (!missionId && !campaignId) {
        return NextResponse.json(
          { error: "campaignId or missionId is required" },
          { status: 400 }
        );
      }

      const rows = await database.get.sseItems({
        campaignId: campaignId || undefined,
        missionId: missionId || undefined,
        scope: scope || "management",
        uploadedBy: uploadedBy || undefined,
        status: status || undefined,
      });
      return NextResponse.json(rows.map(mapSseRowForManagement));
    }

    const items = await database.get.sseItems({
      campaignId: campaignId || undefined,
      missionId: missionId || undefined,
      uploadedBy: uploadedBy || undefined,
      status: status || undefined,
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching SSE items:", error);
    return NextResponse.json({ error: "Failed to fetch SSE items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const isScopedPayload =
      body.scope === "management" || !!body.missionId || !!body.title;

    if (isScopedPayload) {
      const title = String(body.title ?? "").trim();
      let campaignId = String(body.campaignId ?? "").trim();
      const missionIdRaw = body.missionId ? String(body.missionId).trim() : "";

      if (!title) {
        return NextResponse.json(
          { error: "owner (campaignId/missionId) and title are required" },
          { status: 400 }
        );
      }

      if (!campaignId && missionIdRaw) {
        const cid = await database.get.missionCampaignId(missionIdRaw);
        if (!cid) {
          return NextResponse.json({ error: "Mission not found" }, { status: 400 });
        }
        campaignId = cid;
      }

      if (!campaignId) {
        return NextResponse.json(
          { error: "campaignId is required (or missionId to resolve campaign)" },
          { status: 400 }
        );
      }

      const collectedDate =
        body.collectedDate != null && String(body.collectedDate).trim() !== ""
          ? String(body.collectedDate).trim().slice(0, 10)
          : null;

      const id = await database.post.sseItem({
        campaignId,
        missionId: missionIdRaw || null,
        type: String(body.type ?? "EVIDENCE"),
        name: title,
        description: String(body.description ?? ""),
        status: String(body.status ?? "LOGGED"),
        minimumRole: UserRole.member,
        imageUrl: String(body.imageUrl ?? ""),
        classification: body.classification != null ? String(body.classification) : null,
        collectedDate,
        uploadedBy: session.user.id!,
      });

      const row = await database.get.sseItemById(id);
      const item = row ? mapSseRowForManagement(row) : null;
      await postAdminAlert({
        label: "SSE UPLOADED",
        message: `${title} uploaded${missionIdRaw ? ` and linked to mission ${missionIdRaw}` : ""}.`,
        createdBy: session.user.id!,
      });
      return NextResponse.json({ success: true, item }, { status: 201 });
    }

    const id = await database.post.sseItem({
      campaignId: body.campaignId,
      missionId: body.missionId ?? null,
      type: body.type,
      name: body.name,
      description: body.description,
      status: body.status,
      minimumRole: body.minimumRole,
      imageUrl: body.imageUrl,
      classification: body.classification ?? null,
      collectedDate:
        body.collectedDate != null && String(body.collectedDate).trim() !== ""
          ? String(body.collectedDate).trim().slice(0, 10)
          : null,
      uploadedBy: session.user.id!,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating SSE item:", error);
    return NextResponse.json({ error: "Failed to create SSE item" }, { status: 500 });
  }
}

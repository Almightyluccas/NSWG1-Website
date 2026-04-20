import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from "@/types/database";

type PlanningDoc = {
  id: string;
  ownerType: "campaign" | "mission";
  ownerId: string;
  title: string;
  description: string;
  docType: string;
  classification: string;
  fileUrl: string;
  date: string;
  createdAt: string;
  createdBy: string;
};

const planningDocStore: PlanningDoc[] = [];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.member)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = request.nextUrl.searchParams.get("campaignId");
  const missionId = request.nextUrl.searchParams.get("missionId");

  if (!campaignId && !missionId) {
    return NextResponse.json({ error: "campaignId or missionId is required" }, { status: 400 });
  }

  const ownerType = missionId ? "mission" : "campaign";
  const ownerId = missionId ?? campaignId!;

  return NextResponse.json(
    planningDocStore.filter((doc) => doc.ownerType === ownerType && doc.ownerId === ownerId),
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const ownerType = body.missionId ? "mission" : "campaign";
  const ownerId = String(body.missionId ?? body.campaignId ?? "").trim();
  const title = String(body.title ?? "").trim();

  if (!ownerId || !title) {
    return NextResponse.json(
      { error: "owner (campaignId/missionId) and title are required" },
      { status: 400 },
    );
  }

  // TODO: Replace in-memory storage with database persistence and file storage.
  const nextDoc: PlanningDoc = {
    id: `doc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    ownerType,
    ownerId,
    title,
    description: String(body.description ?? ""),
    docType: String(body.docType ?? "OTHER"),
    classification: String(body.classification ?? "UNCLASSIFIED"),
    fileUrl: String(body.fileUrl ?? ""),
    date: String(body.date ?? ""),
    createdAt: new Date().toISOString(),
    createdBy: session.user.id ?? "unknown",
  };

  planningDocStore.unshift(nextDoc);
  return NextResponse.json({ success: true, item: nextDoc }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from "@/types/database";

type MissionIntelRecord = {
  missionId: string;
  regionalIntel: string;
  operationalIntel: string;
  updatedAt: string;
  updatedBy: string;
};

const missionIntelStore = new Map<string, MissionIntelRecord>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.member)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missionId = request.nextUrl.searchParams.get("missionId");
  if (!missionId) {
    return NextResponse.json({ error: "missionId is required" }, { status: 400 });
  }

  const record = missionIntelStore.get(missionId) ?? {
    missionId,
    regionalIntel: "",
    operationalIntel: "",
    updatedAt: "",
    updatedBy: "",
  };

  return NextResponse.json(record);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const missionId = String(body.missionId ?? "").trim();
  if (!missionId) {
    return NextResponse.json({ error: "missionId is required" }, { status: 400 });
  }

  // TODO: Replace in-memory storage with database persistence.
  const nextRecord: MissionIntelRecord = {
    missionId,
    regionalIntel: String(body.regionalIntel ?? ""),
    operationalIntel: String(body.operationalIntel ?? ""),
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.id ?? "unknown",
  };

  missionIntelStore.set(missionId, nextRecord);
  return NextResponse.json({ success: true, intel: nextRecord });
}

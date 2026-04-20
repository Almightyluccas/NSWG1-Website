import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from "@/types/database";

type CampaignIntelRecord = {
  campaignId: string;
  regionalIntel: string;
  operationalIntel: string;
  updatedAt: string;
  updatedBy: string;
};

const campaignIntelStore = new Map<string, CampaignIntelRecord>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes(UserRole.member)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = request.nextUrl.searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const record = campaignIntelStore.get(campaignId) ?? {
    campaignId,
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
  const campaignId = String(body.campaignId ?? "").trim();
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  // TODO: Replace in-memory storage with database persistence.
  const nextRecord: CampaignIntelRecord = {
    campaignId,
    regionalIntel: String(body.regionalIntel ?? ""),
    operationalIntel: String(body.operationalIntel ?? ""),
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.id ?? "unknown",
  };

  campaignIntelStore.set(campaignId, nextRecord);
  return NextResponse.json({ success: true, intel: nextRecord });
}

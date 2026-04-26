import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { roleHierarchy, UserRole } from "@/types/database";

/** Minimum role level required to submit AARs (instructor+) */
const AAR_MIN_LEVEL = roleHierarchy[UserRole.instructor] ?? 50;

function hasMinLevel(roles: string[]): boolean {
  const userLevel = Math.max(0, ...roles.map((r) => roleHierarchy[r] || 0));
  return userLevel >= AAR_MIN_LEVEL;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId =
      request.nextUrl.searchParams.get("campaignId") || undefined;
    const missionId =
      request.nextUrl.searchParams.get("missionId") || undefined;

    const reports = await database.get.afterActionReports(
      campaignId,
      missionId
    );
    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET /api/aar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AARs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Instructor+ required to submit AARs
    if (!hasMinLevel(session.user.roles)) {
      return NextResponse.json(
        { error: "Insufficient rank to submit AARs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.campaignId || !body.title || !body.summary) {
      return NextResponse.json(
        { error: "campaignId, title, and summary are required" },
        { status: 400 }
      );
    }

    const id = await database.post.afterActionReport({
      campaignId: body.campaignId,
      missionId: body.missionId,
      title: body.title,
      summary: body.summary,
      keyOutcomes: body.keyOutcomes,
      lessonsLearned: body.lessonsLearned,
      submittedBy: session.user.id!,
      status: body.status || "submitted",
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/aar error:", error);
    return NextResponse.json(
      { error: "Failed to create AAR" },
      { status: 500 }
    );
  }
}

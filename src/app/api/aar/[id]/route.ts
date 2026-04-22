import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

/** Roles that can review AARs */
const REVIEW_ROLES = [
  UserRole.admin,
  UserRole.superAdmin,
  UserRole.developer,
  UserRole.intelligence,
  UserRole.trainingAndDevelopment,
];

function canReview(roles: string[]): boolean {
  return roles.some((r) => REVIEW_ROLES.some((allowed) => allowed === r));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await database.get.afterActionReportById(parseInt(id));

    if (!report) {
      return NextResponse.json({ error: "AAR not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/aar/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch AAR" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canReview(session.user.roles)) {
      return NextResponse.json({ error: "Insufficient role to review AARs" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await database.put.afterActionReportStatus(
      parseInt(id),
      body.status || "reviewed",
      session.user.id!
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/aar/[id] error:", error);
    return NextResponse.json({ error: "Failed to update AAR" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await database.delete.afterActionReport(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/aar/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete AAR" }, { status: 500 });
  }
}

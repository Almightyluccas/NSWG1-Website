import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

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
    const campaign = await database.get.operationCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [missions, documents, intel, sseItems, aars] = await Promise.all([
      database.get.missionsByCampaign(id),
      database.get.operationDocuments(id),
      database.get.operationIntel(id),
      database.get.sseItems(id),
      database.get.afterActionReports(id),
    ]);

    // Fetch RSVPs and attendance for each mission
    const missionsWithDetails = await Promise.all(
      missions.map(async (mission: any) => {
        const [rsvps, attendance] = await Promise.all([
          database.get.missionRSVPs(mission.id),
          database.get.missionAttendance(mission.id),
        ]);
        return { ...mission, rsvps, attendance };
      })
    );

    return NextResponse.json({
      ...campaign,
      missions: missionsWithDetails,
      documents,
      intel,
      sse_items: sseItems,
      after_action_reports: aars,
    });
  } catch (error) {
    console.error("Error fetching operation detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch operation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await database.put.campaignOperationFields(id, {
      codename: body.codename,
      minimumRole: body.minimumRole,
      ao: body.ao,
      brief: body.brief,
      commander: body.commander,
      forceComp: body.forceComp,
      missionType: body.missionType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating operation:", error);
    return NextResponse.json(
      { error: "Failed to update operation" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { format } from "date-fns";
import crypto from "crypto";
import { UserRole } from "@/types/database";

function getStatusFromDates(
  startDate: string,
  endDate: string,
  currentStatus: string
): string {
  const now = new Date();
  const nowString = format(now, "yyyy-MM-dd");

  if (currentStatus === "cancelled") {
    return currentStatus;
  }

  if (nowString < startDate) {
    return "planning";
  } else if (nowString > endDate) {
    return "completed";
  } else {
    return "active";
  }
}

function getMissionStatusFromDate(
  date: string,
  time: string,
  currentStatus: string
): string {
  const now = new Date();
  const nowString = format(now, "yyyy-MM-dd");
  const nowTime = format(now, "HH:mm");

  if (currentStatus === "cancelled") {
    return currentStatus;
  }

  if (nowString < date || (nowString === date && nowTime < time)) {
    return "scheduled";
  } else if (nowString > date || (nowString === date && nowTime > time)) {
    const [hours, minutes] = time.split(":").map(Number);
    const endHours = hours + 3;
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    if (nowString === date && nowTime < endTime) {
      return "in-progress";
    } else {
      return "completed";
    }
  } else {
    return "in-progress";
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const isAdmin = session.user.roles.includes(UserRole.admin);
    const campaigns = await database.get.campaigns(session.user.id, isAdmin);

    const campaignsWithMissions = await Promise.all(
      campaigns.map(async (campaign) => {
        const newStatus = getStatusFromDates(
          campaign.start_date,
          campaign.end_date,
          campaign.status
        );
        if (newStatus !== campaign.status) {
          await database.put.campaignStatus(campaign.id, newStatus);
          campaign.status = newStatus;
        }

        const missions = await database.get.missionsByCampaign(campaign.id);

        const missionsWithData = await Promise.all(
          missions.map(async (mission) => {
            const newMissionStatus = getMissionStatusFromDate(
              mission.date,
              mission.time,
              mission.status
            );
            if (newMissionStatus !== mission.status) {
              await database.put.missionStatus(mission.id, newMissionStatus);
              mission.status = newMissionStatus;
            }

            const rsvps = await database.get.missionRSVPs(mission.id);
            const attendance = await database.get.missionAttendance(mission.id);

            return {
              ...mission,
              rsvps: rsvps.map((rsvp) => ({
                id: rsvp.id,
                missionId: rsvp.mission_id,
                userId: rsvp.user_id,
                userName: rsvp.user_name,
                status: rsvp.status,
                notes: rsvp.notes,
                createdAt: rsvp.created_at,
                updatedAt: rsvp.updated_at,
              })),
              attendance: attendance.map((att) => ({
                id: att.id,
                missionId: att.mission_id,
                userId: att.user_id,
                userName: att.user_name,
                status: att.status,
                notes: att.notes,
                markedBy: att.marked_by,
                markedAt: att.marked_at,
              })),
            };
          })
        );
        return {
          ...campaign,
          missions: missionsWithData,
        };
      })
    );

    return NextResponse.json(campaignsWithMissions);
  } catch (error) {
    console.error("GET /api/campaigns error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();
    const id = `campaign-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const status = getStatusFromDates(data.startDate, data.endDate, "planning");

    await database.post.campaign({
      id,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status,
      createdBy: session.user.id!,
    });

    // If operation fields are provided, set them immediately
    if (data.codename || data.ao || data.brief || data.commander || data.forceComp || data.missionType) {
      await database.put.campaignOperationFields(id, {
        codename: data.codename,
        ao: data.ao,
        brief: data.brief,
        commander: data.commander,
        forceComp: data.forceComp,
        missionType: data.missionType,
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST /api/campaigns error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

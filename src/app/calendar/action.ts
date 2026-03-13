"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { format } from "date-fns";

const db = DatabaseClient.getInstance();

function getStatusFromDates(
  startDate: string,
  endDate: string,
  currentStatus: string
): string {
  const now = new Date();
  const nowString = format(now, "yyyy-MM-dd");

  // Don't change manually set statuses like 'cancelled'
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

  // Don't change manually set statuses like 'cancelled'
  if (currentStatus === "cancelled") {
    return currentStatus;
  }

  if (nowString < date || (nowString === date && nowTime < time)) {
    return "scheduled";
  } else if (nowString > date || (nowString === date && nowTime > time)) {
    // Assume 3 hours duration for missions/training
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

export async function getUsersForSelection() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const users = await db.get.usersForSelection();

  // Filter to only include users with "member" role
  return users.filter((user) => user.role.includes("member"));
}

export async function getUsersForAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const users = await db.get.usersForSelection();

  // Filter to only include users with member, tacdevron, or 160th roles
  return users
    .filter(
      (user) =>
        user.role.includes("member") ||
        user.role.includes("tacdevron") ||
        user.role.includes("160th")
    )
    .map((user) => ({
      ...user,
      primaryRole: user.role.includes("tacdevron")
        ? "tacdevron"
        : user.role.includes("160th")
          ? "160th"
          : "member",
    }));
}

export async function getCampaigns() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.roles.includes("admin");
  const campaigns = await db.get.campaigns(session.user.id, isAdmin);

  // Update campaign statuses based on dates and get missions
  const campaignsWithMissions = await Promise.all(
    campaigns.map(async (campaign) => {
      // Update campaign status based on dates
      const newStatus = getStatusFromDates(
        campaign.start_date,
        campaign.end_date,
        campaign.status
      );
      if (newStatus !== campaign.status) {
        await db.put.campaignStatus(campaign.id, newStatus);
        campaign.status = newStatus;
      }

      const missions = await db.get.missionsByCampaign(campaign.id);

      // Update mission statuses and get RSVPs/calendar
      const missionsWithData = await Promise.all(
        missions.map(async (mission) => {
          // Update mission status based on date/time
          const newMissionStatus = getMissionStatusFromDate(
            mission.date,
            mission.time,
            mission.status
          );
          if (newMissionStatus !== mission.status) {
            await db.put.missionStatus(mission.id, newMissionStatus);
            mission.status = newMissionStatus;
          }

          const rsvps = await db.get.missionRSVPs(mission.id);
          const attendance = await db.get.missionAttendance(mission.id);

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

  return campaignsWithMissions;
}

export async function getTrainingRecords() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.roles.includes("admin");
  const trainingRecords = await db.get.trainingRecords(
    session.user.id,
    isAdmin
  );

  const trainingWithData = await Promise.all(
    trainingRecords.map(async (training) => {
      const newStatus = getMissionStatusFromDate(
        training.date,
        training.time,
        training.status
      );
      if (newStatus !== training.status) {
        await db.put.trainingStatus(training.id, newStatus);
        training.status = newStatus;
      }

      const rsvps = await db.get.trainingRSVPs(training.id);
      const attendance = await db.get.trainingAttendance(training.id);

      return {
        ...training,
        rsvps: rsvps.map((rsvp) => ({
          id: rsvp.id,
          trainingId: rsvp.training_id,
          userId: rsvp.user_id,
          userName: rsvp.user_name,
          status: rsvp.status,
          notes: rsvp.notes,
          createdAt: rsvp.created_at,
          updatedAt: rsvp.updated_at,
        })),
        attendance: attendance.map((att) => ({
          id: att.id,
          trainingId: att.training_id,
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

  return trainingWithData;
}

export async function getMissionsByDateRange(
  startDate: string,
  endDate: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const missions = await db.get.missionsByDateRange(startDate, endDate);

  const missionsWithData = await Promise.all(
    missions.map(async (mission) => {
      const newStatus = getMissionStatusFromDate(
        mission.date,
        mission.time,
        mission.status
      );
      if (newStatus !== mission.status) {
        await db.put.missionStatus(mission.id, newStatus);
        mission.status = newStatus;
      }

      const rsvps = await db.get.missionRSVPs(mission.id);
      const attendance = await db.get.missionAttendance(mission.id);

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

  return missionsWithData;
}

export async function getTrainingByDateRange(
  startDate: string,
  endDate: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const training = await db.get.trainingByDateRange(startDate, endDate);

  const trainingWithData = await Promise.all(
    training.map(async (trainingRecord) => {
      const newStatus = getMissionStatusFromDate(
        trainingRecord.date,
        trainingRecord.time,
        trainingRecord.status
      );
      if (newStatus !== trainingRecord.status) {
        await db.put.trainingStatus(trainingRecord.id, newStatus);
        trainingRecord.status = newStatus;
      }

      const rsvps = await db.get.trainingRSVPs(trainingRecord.id);
      const attendance = await db.get.trainingAttendance(trainingRecord.id);

      return {
        ...trainingRecord,
        rsvps: rsvps.map((rsvp) => ({
          id: rsvp.id,
          trainingId: rsvp.training_id,
          userId: rsvp.user_id,
          userName: rsvp.user_name,
          status: rsvp.status,
          notes: rsvp.notes,
          createdAt: rsvp.created_at,
          updatedAt: rsvp.updated_at,
        })),
        attendance: attendance.map((att) => ({
          id: att.id,
          trainingId: att.training_id,
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

  return trainingWithData;
}

export async function getAttendanceRecords(userId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const targetUserId = userId || session.user.id!;
  const records = await db.get.attendanceRecords(targetUserId);

  return records.map((record) => ({
    date: record.date, // Already formatted as yyyy-mm-dd from database
    status: record.status,
    event: record.event_name,
  }));
}

export async function getAttendanceStats(userId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const targetUserId = userId || session.user.id!;
  const records = await db.get.attendanceRecords(targetUserId);

  const totalEvents = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const excusedCount = records.filter((r) => r.status === "excused").length;

  const attendanceRate =
    totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;
  const punctualityRate =
    totalEvents > 0
      ? Math.round((presentCount / (presentCount + lateCount)) * 100)
      : 0;

  // Get this month's events using string comparison
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const thisMonthEvents = records.filter((record) => {
    return record.date.startsWith(currentMonth);
  }).length;

  return {
    totalEvents,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    attendanceRate,
    punctualityRate,
    thisMonthEvents,
    records: records.map((record) => ({
      date: record.date, // Already formatted as yyyy-mm-dd
      status: record.status,
      event: record.event_name,
      eventType: record.event_type,
    })),
  };
}

export async function createCampaign(data: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const campaignId = `camp-${Date.now()}`;
  const status = getStatusFromDates(data.startDate, data.endDate, "planning");

  await db.post.campaign({
    id: campaignId,
    name: data.name,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    status,
    createdBy: session.user.id!,
  });

  return campaignId;
}

export async function updateCampaignEndDate(
  campaignId: string,
  endDate: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  await db.put.campaignEndDate(campaignId, endDate);

  // Update status based on new end date
  const campaign = await db.get.campaignById(campaignId);
  if (campaign) {
    const newStatus = getStatusFromDates(
      campaign.start_date,
      endDate,
      campaign.status
    );
    if (newStatus !== campaign.status) {
      await db.put.campaignStatus(campaignId, newStatus);
    }
  }

  return true;
}

export async function createMission(data: {
  campaignId: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxPersonnel?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const missionId = `mission-${Date.now()}`;
  const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

  await db.post.mission({
    id: missionId,
    campaignId: data.campaignId,
    name: data.name,
    description: data.description,
    date: data.date,
    time: data.time,
    location: data.location,
    maxPersonnel: data.maxPersonnel,
    status,
    createdBy: session.user.id!,
  });

  return missionId;
}

export async function createTrainingRecord(data: {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  maxPersonnel?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const trainingId = `training-${Date.now()}`;
  const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

  await db.post.trainingRecord({
    id: trainingId,
    name: data.name,
    description: data.description,
    date: data.date,
    time: data.time,
    location: data.location,
    instructor: data.instructor,
    maxPersonnel: data.maxPersonnel,
    status,
    createdBy: session.user.id!,
  });

  return trainingId;
}

export async function createOrUpdateMissionRSVP(data: {
  missionId: string;
  status: "attending" | "not-attending" | "maybe";
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const rsvpId = `rsvp-${data.missionId}-${session.user.id}`;

  try {
    await db.post.missionRSVP({
      id: rsvpId,
      missionId: data.missionId,
      userId: session.user.id!,
      userName: session.user.name || session.user.email || "Unknown",
      status: data.status,
      notes: data.notes,
    });

    return rsvpId;
  } catch (error) {
    console.error("Failed to create/update mission RSVP:", error);
    throw error;
  }
}

export async function createOrUpdateTrainingRSVP(data: {
  trainingId: string;
  status: "attending" | "not-attending" | "maybe";
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const rsvpId = `trsvp-${data.trainingId}-${session.user.id}`;

  try {
    await db.post.trainingRSVP({
      id: rsvpId,
      trainingId: data.trainingId,
      userId: session.user.id!,
      userName: session.user.name || session.user.email || "Unknown",
      status: data.status,
      notes: data.notes,
    });

    return rsvpId;
  } catch (error) {
    console.error("Failed to create/update training RSVP:", error);
    throw error;
  }
}

export async function markMissionAttendance(data: {
  missionId: string;
  userId: string;
  userName: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const attendanceId = `att-${data.missionId}-${data.userId}`;

  await db.post.missionAttendance({
    id: attendanceId,
    missionId: data.missionId,
    userId: data.userId,
    userName: data.userName,
    status: data.status,
    notes: data.notes,
    markedBy: session.user.id!,
  });

  return attendanceId;
}

export async function markTrainingAttendance(data: {
  trainingId: string;
  userId: string;
  userName: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const attendanceId = `tatt-${data.trainingId}-${data.userId}`;

  await db.post.trainingAttendance({
    id: attendanceId,
    trainingId: data.trainingId,
    userId: data.userId,
    userName: data.userName,
    status: data.status,
    notes: data.notes,
    markedBy: session.user.id!,
  });

  return attendanceId;
}

export async function updateCampaign(
  campaignId: string,
  data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  await db.put.campaign(campaignId, data);

  const newStatus = getStatusFromDates(
    data.startDate,
    data.endDate,
    "planning"
  );
  await db.put.campaignStatus(campaignId, newStatus);

  return true;
}

export async function deleteCampaign(campaignId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  await db.delete.campaign(campaignId);
  return true;
}

export async function updateMission(
  missionId: string,
  data: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    maxPersonnel?: number;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

  await db.put.mission(missionId, data);
  await db.put.missionStatus(missionId, status);

  return true;
}

export async function deleteMission(missionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  await db.delete.mission(missionId);
  return true;
}

export async function updateTrainingRecord(
  trainingId: string,
  data: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    instructor?: string;
    maxPersonnel?: number;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const status = getMissionStatusFromDate(data.date, data.time, "scheduled");

  await db.put.trainingRecord(trainingId, data);
  await db.put.trainingStatus(trainingId, status);

  return true;
}

export async function deleteTrainingRecord(trainingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes("admin")) {
    throw new Error("Unauthorized");
  }

  await db.delete.trainingRecord(trainingId);
  return true;
}

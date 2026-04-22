import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { addWeeks, format, startOfWeek, addDays } from "date-fns";
import type { ProcessingResult } from "@/types/recurring-training";
import { UserRole } from "@/types/database";

function getMissionStatusFromDate(
  date: string,
  time: string,
  currentStatus: string
): string {
  const now = new Date();
  const nowString = format(now, "yyyy-MM-dd");
  const nowTime = format(now, "HH:mm");

  if (currentStatus === "cancelled") return currentStatus;

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

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const recurringTrainings = await database.get.activeRecurringTrainings();
  const results: ProcessingResult[] = [];

  for (const recurring of recurringTrainings) {
    try {
      // Process the next 3 weeks for each recurring training
      for (let weekOffset = 1; weekOffset <= 3; weekOffset++) {
        const targetWeek = addWeeks(new Date(), weekOffset);
        const startOfTargetWeek = startOfWeek(targetWeek, { weekStartsOn: 0 }); // Sunday = 0
        const trainingDate = addDays(startOfTargetWeek, recurring.day_of_week);
        const trainingDateStr = format(trainingDate, "yyyy-MM-dd");

        const instanceExists =
          await database.get.recurringTrainingInstanceExists(
            recurring.id,
            trainingDateStr
          );
        if (instanceExists) {
          results.push({
            recurringId: recurring.id,
            name: recurring.name,
            status: "skipped",
            reason: `Training already exists for week ${weekOffset} (${trainingDateStr})`,
          });
          continue;
        }

        const missionConflicts =
          await database.get.missionConflictsOnDate(trainingDateStr);

        let finalDate = trainingDateStr;
        let conflictResolved = false;

        if (missionConflicts.length > 0 && weekOffset <= 2) {
          const nextWeekDate = addWeeks(trainingDate, 1);
          const nextWeekDateStr = format(nextWeekDate, "yyyy-MM-dd");

          const nextWeekConflicts =
            await database.get.missionConflictsOnDate(nextWeekDateStr);

          if (nextWeekConflicts.length === 0) {
            finalDate = nextWeekDateStr;
            conflictResolved = true;
          }
        } else if (missionConflicts.length === 0) {
          conflictResolved = true;
        }

        if (!conflictResolved) {
          results.push({
            recurringId: recurring.id,
            name: recurring.name,
            status: "skipped",
            reason: `Mission conflicts on week ${weekOffset} (${trainingDateStr})`,
          });
          continue;
        }

        const status = getMissionStatusFromDate(finalDate, recurring.time, "scheduled");
        const trainingId = `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await database.post.trainingRecord({
          id: trainingId,
          name: recurring.name,
          description: recurring.description,
          date: finalDate,
          time: recurring.time,
          location: recurring.location,
          instructor: recurring.instructor,
          maxPersonnel: recurring.max_personnel !== null ? recurring.max_personnel : 40,
          status,
          createdBy: "Auto-Scheduler",
        });

        const instanceId = `instance-${Date.now()}-${weekOffset}-${Math.random().toString(36).substr(2, 9)}`;

        await database.post.recurringTrainingInstance({
          id: instanceId,
          recurringTrainingId: recurring.id,
          trainingId: trainingId,
          scheduledDate: finalDate,
        });

        results.push({
          recurringId: recurring.id,
          name: recurring.name,
          trainingId: trainingId,
          scheduledDate: finalDate,
          status: "created",
          rescheduled: finalDate !== trainingDateStr,
          weekOffset: weekOffset,
        });
      }
    } catch (error) {
      console.error(
        `Failed to process recurring training ${recurring.id}:`,
        error
      );
      results.push({
        recurringId: recurring.id,
        name: recurring.name,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json(results);
}

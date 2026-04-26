import {
  getMissionsByDateRange,
  getTrainingByDateRange,
} from "@/app/dashboard/calendar/action";
import { format, addDays } from "date-fns";
import { UpcomingOpsWidget } from "./upcoming-ops-widget";

export default async function UpcomingOpsServerWidget({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const futureStr = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const upcomingMissions = await getMissionsByDateRange(todayStr, futureStr);
  const upcomingTrainings = await getTrainingByDateRange(todayStr, futureStr);

  const nowTime = format(new Date(), "HH:mm");
  const allUpcoming = [
    ...upcomingMissions.map((m: any) => ({ ...m, type: "mission" })),
    ...upcomingTrainings.map((t: any) => ({ ...t, type: "training" })),
  ]
    .filter((event) => {
      if (event.date > todayStr) return true;
      if (event.date === todayStr && event.time >= nowTime) return true;
      return false;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    })
    .slice(0, 2);

  return (
    <UpcomingOpsWidget
      upcomingOps={allUpcoming}
      currentUserId={currentUserId}
    />
  );
}

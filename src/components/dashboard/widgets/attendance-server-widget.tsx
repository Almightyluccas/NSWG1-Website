import { database } from "@/database";
import { AttendanceWidget } from "./attendance-widget";

export default async function AttendanceServerWidget({ userId }: { userId: string }) {
  let attendanceRecords: any[] = [];
  try {
    if (userId) {
      const records = await database.get.attendanceRecords(userId);
      attendanceRecords = records.map((r: any) => ({
        date: r.date || "",
        status: r.status || "present",
        event_name: r.event_name || "Unknown Event",
        event_type: r.event_type || "mission",
      }));
    }
  } catch {
    attendanceRecords = [];
  }

  return <AttendanceWidget records={attendanceRecords} />;
}

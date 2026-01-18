export interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late" | "LOA";
  event: string;
}
export interface AttendanceData {
  [userId: string]: AttendanceRecord[];
}

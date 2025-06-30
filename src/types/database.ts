export enum UserRole {
  guest = 'guest',
  applicant = 'applicant',
  candidate = 'candidate',
  administration = 'J-1',
  intelligence = 'J-2',
  trainingAndDevelopment = 'J-3',
  logistics = 'J-4',
  greenTeam = 'greenTeam',
  member = 'member',
  '160th' = '160th',
  tacdevron = 'tacdevron',
  instructor = 'instructor',
  admin = 'admin',
  superAdmin = 'superAdmin',
  developer = 'developer',
}

export interface User {
  id: string;
  perscom_id: number | null;
  steam_id: string | null;
  discord_username: string;
  name: string | null;
  date_of_birth: Date | null;
  email: string;
  created_at: Date;
  role: UserRole[];
  imageUrl?: string | null;
}

export interface Campaign {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed" | "cancelled"
  createdBy: string
  createdAt: string
  missions: Mission[]
}

export interface Mission {
  id: string
  campaignId: string
  name: string
  description: string
  date: string
  time: string
  location: string
  maxPersonnel?: number
  requiredMOS?: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  createdBy: string
  createdAt: string
  rsvps: RSVP[]
  attendance: AttendanceRecord[]
}

export interface RSVP {
  id: string
  missionId: string
  userId: string
  userName: string
  status: "attending" | "not-attending" | "maybe"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecord {
  id: string
  missionId: string
  userId: string
  userName: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
  markedBy: string
  markedAt: string
}
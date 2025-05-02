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

export interface UserInformation {
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
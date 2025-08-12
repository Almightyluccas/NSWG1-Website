import { DefaultSession } from "next-auth";
import { CustomTheme, Preferences} from "@/types/database";

export interface SessionUser {
  roles: string[];
  name: string | null | undefined;
  image: string | null | undefined;
  email: string | null | undefined;
  discordName: string | null | undefined;
  perscomId: string | null | undefined;
  id: string | undefined;
  customThemes: CustomTheme[];
  preferences: Preferences;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"],
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user_id: string;
    roles: string[];
    perscomId: string | null;
    preferences: Preferences;
    customThemes: CustomTheme[];
    name: string | null;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    image?: string | null;
    email?: string | null;
    discordName?: string | null;
    error?: string;
  }
}

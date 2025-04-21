import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      roles: string[];
      discordName: string | null | undefined;
      perscomId: string | null | undefined;
      id: string | undefined;
    } & DefaultSession["user"];
  }
}

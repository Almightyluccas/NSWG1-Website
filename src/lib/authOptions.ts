import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import migrateDb from "@/db/migrate";
import { addRefreshTokenDb, addUserDb, retrieveUserRolesDb } from "@/db/client";
import { encryptToken } from "@/lib/cryptoUtils";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        console.log(token);
        console.log(account);
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        try {
          await migrateDb();
          await addUserDb(account.providerAccountId, user.name!, user.email!);

          const refreshToken = encryptToken(account.refresh_token!);
          await addRefreshTokenDb(account.providerAccountId, refreshToken, new Date(account.expires_at! * 1000));

        } catch (error) {
          console.error("Database error:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      try {
        const roles = await retrieveUserRolesDb(token.sub!);
        session.user =  {
          ...session.user,
          roles: roles
        };
        return session;
      } catch (error) {
        console.error("Database error:", error)
        return session
      }
    }
  }
}
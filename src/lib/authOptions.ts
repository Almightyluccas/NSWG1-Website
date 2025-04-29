import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import migrateDb from "@/db/migrate";
import {addRefreshTokenDb, addUserDb, retrieveUserInfoDb, saveUserProfileImageDb } from "@/db/client";
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
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        try {
          await migrateDb(); //TODO: Remove this when finished with development
          await addUserDb(account.providerAccountId, user.name!, user.email!);
          await saveUserProfileImageDb(account.providerAccountId, user.image!);

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
        const {roles, perscomId, name} = await retrieveUserInfoDb(token.sub!);
        session.user =  {
          ...session.user,
          discordName: session.user.name,
          name: name ? name : session.user.name,
          perscomId: perscomId ? perscomId : undefined,
          id: token.sub,
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
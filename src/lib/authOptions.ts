import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { encryptToken } from "@/lib/cryptoUtils";
import { database } from "@/database";

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
          await database.migrate.migrate(); //TODO: Remove this when finished with development
          await database.post.user(account.providerAccountId, user.name!, user.email!);
          await database.post.userProfileImage(account.providerAccountId, user.image!);

          const refreshToken = encryptToken(account.refresh_token!);
          await database.post.refreshToken(account.providerAccountId, refreshToken, new Date(account.expires_at! * 1000));

        } catch (error) {
          console.error("Database error:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      try {
        const {roles, perscomId, name} = await database.get.userInfo(token.sub!);
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
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url

      return baseUrl
    }

  }
}
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
    async jwt({ token, account, user }) {
      if (account && user) {
        if (account.refresh_token) {
          await database.put.userRefreshToken(user.id, account.refresh_token, account.expires_at || 604800);
        }
        return {
          ...token,
          access_token: account.access_token,
          expires_at: Math.floor(Date.now() / 1000 + (typeof account.expires_in === 'number' ? account.expires_in : 3600)),
          refresh_token: account.refresh_token,
          user_id: user.id,
        };
      }

      if (Date.now() < (token.expires_at as number) * 1000) return token;

      return await refreshAccessToken(token);
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

export async function refreshAccessToken(token: any) {
  try {
    const refreshToken = await database.get.userRefreshToken(token.user_id);
    const url = "https://discord.com/api/oauth2/token";
    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      method: "POST"
    });

    const refreshedTokens = await response.json();
    if (!response.ok) throw new Error("Failed to refresh token");

    await database.put.userRefreshToken(token.user_id, refreshedTokens.refresh_token, refreshedTokens.expires_in || 604800);

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + (refreshedTokens.expires_in || 3600)),
      refresh_token: refreshedTokens.refresh_token,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    await database.put.userRefreshToken(token.user_id, null, null);
    throw new Error("RefreshAccessTokenError");
  }
  }
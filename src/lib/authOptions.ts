import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { database } from "@/database";
import { hashToken } from "@/lib/cryptoUtils";
import { headers } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account && user) {
        const { roles, perscomId, name, preferences, customThemes } = await database.get.userInfo(user.id);

        return {
          ...token,
          access_token: account.access_token,
          expires_at: Math.floor(Date.now() / 1000 + (typeof account.expires_in === 'number' ? account.expires_in : 3600)),
          refresh_token: account.refresh_token,
          user_id: user.id,
          roles: roles,
          perscomId: perscomId,
          name: name,
          preferences: preferences,
          customThemes: customThemes,
        };
      }

      if (trigger === "update" && session) {
        if (session.preferences) {
          await database.put.userPreferences(session.preferences, token.user_id);
          token.preferences = { ...token.preferences, ...session.preferences };
        }

        if (session.customTheme) {
          await database.post.userCustomTheme(token.user_id, session.customTheme);
          token.customThemes.push(session.customTheme);
        }
        if (session.name) {
          console.log("Updating user name:", session.name);
          await database.put.userName(token.user_id, session.name);
          token.name = session.name;
        }
      }

      if (Date.now() < (token.expires_at as number) * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async signIn({ user, account }) {
      if (account?.provider === "discord" && account.refresh_token) {
        try {
          const heads = await headers();
          const ipAddress = heads.get('x-forwarded-for') ?? 'unknown';
          const userAgent = heads.get('user-agent') ?? 'unknown';

          await database.post.user(account.providerAccountId, user.name!, user.email!);
          await database.post.userProfileImage(account.providerAccountId, user.image!);

          await database.post.defaultUserPreferences(account.providerAccountId);

          const hashedRefreshToken = hashToken(account.refresh_token);
          const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

          await database.post.createRefreshToken(account.providerAccountId, hashedRefreshToken, expiresAt, ipAddress, userAgent);

        } catch (error) {
          console.error("Database error during sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
        session.user =  {
          ...session.user,
          discordName: session.user.name,
          name: token.name ? token.name : session.user.name,
          perscomId: token.perscomId ? token.perscomId : undefined,
          id: token.sub,
          email: session.user.email,
          image: session.user.image,
          preferences: token.preferences,
          customThemes: token.customThemes,
          roles: token.roles
        };
        return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    }
  },
  events: {
    async signOut({ token }) {
      if (token.refresh_token) {
        try {
          const hashedRefreshToken = hashToken(token.refresh_token as string);
          await database.put.revokeRefreshToken(hashedRefreshToken);
          console.log("Successfully revoked token on sign out.");
        } catch (error) {
          console.error("Error revoking token on sign out:", error);
        }
      }
    }
  },
};


export async function refreshAccessToken(token: any) {
  try {
    const hashedRefreshToken = hashToken(token.refresh_token);

    const existingToken = await database.get.getRefreshTokenByHash(hashedRefreshToken);
    if (!existingToken) {
      console.error("Refresh token not found, revoked, or expired in DB.");
      throw new Error("Invalid refresh token.");
    }

    const url = "https://discord.com/api/oauth2/token";
    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
      method: "POST"
    });

    const refreshedTokens = await response.json();
    if (!response.ok) {
      console.error("Failed to refresh token with Discord:", refreshedTokens);
      throw new Error("Failed to refresh token.");
    }

    const newHashedToken = hashToken(refreshedTokens.refresh_token);
    const newExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await database.put.updateRefreshToken(hashedRefreshToken, newHashedToken, newExpiresAt);

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + (refreshedTokens.expires_in || 3600)),
      refresh_token: refreshedTokens.refresh_token,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    await database.put.revokeRefreshToken(hashToken(token.refresh_token));

    throw new Error("RefreshAccessTokenError");
  }
}
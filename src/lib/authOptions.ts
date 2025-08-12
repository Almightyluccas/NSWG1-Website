import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { database } from "@/database";
import { hashToken } from "@/lib/cryptoUtils";
import { headers } from "next/headers";

let isRefreshing = false;
let refreshSubscribers: ((token: any | null) => void)[] = [];

const onRefresh = (token: any | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};


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
          token.access_token = account.access_token;
          token.expires_at = Math.floor(Date.now() / 1000 + (typeof account.expires_in === 'number' ? account.expires_in : 3600));
          token.refresh_token = account.refresh_token;
          token.user_id = user.id;
      }

      if (token.user_id) {
        try {
          const { roles, perscomId, name, preferences, customThemes, imageUrl, discordName } = await database.get.userInfo(token.user_id as string);

          let fixedImageUrl = imageUrl;
          if (imageUrl && !imageUrl.startsWith('http') && process.env.OCI_PROFILE_PAR_URL) {
            fixedImageUrl = process.env.OCI_PROFILE_PAR_URL + imageUrl;
          }

          token.roles = roles;
          token.perscomId = perscomId;
          token.name = name;
          token.image = fixedImageUrl;
          token.preferences = preferences;
          token.customThemes = customThemes;
          token.discordName = discordName;

        } catch (dbError) {
          console.error("Error fetching user info from DB in JWT callback:", dbError);
          return { ...token, error: "DatabaseError" };
        }
      }

      if (trigger === "update" && session) {
        if (session.preferences) {
          await database.put.userPreferences(session.preferences, token.user_id);
          token.preferences = { ...token.preferences, ...session.preferences };
        }
        if (session.customTheme) {
          await database.post.userCustomTheme(token.user_id, session.customTheme);
          if (!token.customThemes) token.customThemes = [];
          token.customThemes.push(session.customTheme);
        }
        if (session.name) {
          await database.put.userName(token.user_id, session.name);
          token.name = session.name;
        }
        if (session.image && process.env.OCI_PROFILE_PAR_URL) {
          token.image = process.env.OCI_PROFILE_PAR_URL + session.image;
        }
        return token;
      }

      if (Date.now() < (token.expires_at as number) * 1000) {
        return token;
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((refreshedToken) => {
            resolve(refreshedToken || token);
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshedValues = await refreshAccessToken(token);

        token.access_token = refreshedValues.access_token;
        token.expires_at = refreshedValues.expires_at;
        token.refresh_token = refreshedValues.refresh_token;
        token.error = refreshedValues.error;

        onRefresh(token);
        return token;

      } catch (error) {
        console.error("JWT Callback: Refresh failed.", error);
        onRefresh(null);
        return { ...token, error: "RefreshAccessTokenError" };
      } finally {
        isRefreshing = false;
      }
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
          
          const existingToken = await database.get.refreshTokenByDetails(hashToken(account.refresh_token,), ipAddress, userAgent);
          if (existingToken?.token_hash) {
            await database.put.revokeRefreshToken(existingToken.token_hash);
          }

          const hashedRefreshToken = hashToken(account.refresh_token);
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        discordName: token.discordName,
        name: token.name ? token.name : session.user.name,
        perscomId: token.perscomId ? token.perscomId : undefined,
        id: token.sub!,
        email: session.user.email!,
        image: token.image,
        preferences: token.preferences,
        customThemes: token.customThemes,
        roles: token.roles
      };

      if (token.error) {
        (session as any).error = token.error;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  events: {
    async signOut({ token }) {
      if (token.refresh_token) {
        try {
          const hashedRefreshToken = hashToken(token.refresh_token as string);
          await database.put.revokeRefreshToken(hashedRefreshToken);
        } catch (error) {
          console.error("Error revoking token on sign out:", error);
        }
      }
    }
  },
};

async function refreshAccessToken(token: any) {
  try {
    const oldTokenHash = hashToken(token.refresh_token);
    const existingToken = await database.get.getRefreshTokenByHash(oldTokenHash);

    if (!existingToken) {
      console.error(`Refresh token not found in DB for hash starting with: ${oldTokenHash.slice(0, 7)}`);
      throw new Error("Invalid refresh token.");
    }
    const heads = await headers();
    const currentUserAgent = heads.get('user-agent') ?? 'unknown';
    if (existingToken.user_agent !== currentUserAgent) {
      console.error(`User agent mismatch for refresh token`);
      await database.put.revokeRefreshToken(oldTokenHash);
      throw new Error("Invalid refresh token.");
    }

    const response = await fetch("https://discord.com/api/oauth2/token", {
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
      await database.put.revokeRefreshToken(oldTokenHash);
      throw new Error("Failed to refresh token.");
    }

    const newTokenHash = hashToken(refreshedTokens.refresh_token);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await database.put.updateRefreshToken(oldTokenHash, newTokenHash, newExpiresAt);

    return {
      access_token: refreshedTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + (typeof refreshedTokens.expires_in === 'number' ? refreshedTokens.expires_in : 3600)),
      refresh_token: refreshedTokens.refresh_token,
      error: undefined,
    };
  } catch (error) {
    console.error("Error in refreshAccessToken function:", error);
    throw error;
  }
}

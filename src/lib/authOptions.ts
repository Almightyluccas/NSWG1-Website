import {getServerSession, NextAuthOptions, Session} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { database } from "@/database";
import { hashToken } from "@/lib/cryptoUtils";


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
        // token.expires_at = Math.floor(Date.now() / 1000 + 30);

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

      return token
    },

    async signIn({ user, account }) {
      if (account?.provider === "discord" && account.refresh_token) {
        try {
          await database.post.user(account.providerAccountId, user.name!, user.email!);
          await database.post.userProfileImage(account.providerAccountId, user.image!);
          await database.post.defaultUserPreferences(account.providerAccountId);

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
};

export const getAuthSession = async (): Promise<Session | null> => await getServerSession(authOptions);
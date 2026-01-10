import { getServerSession, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { database } from "@/database";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Default to 30 days
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account && user) {
        token.user_id = user.id;
        token.discordName = user.name;
      }

      // TODO: Implement caching if performance becomes an issue
      // Fetch latest roles/data from DB on every session check (or optimize to cache)
      if (token.user_id) {
        try {
          const {
            roles,
            perscomId,
            name,
            preferences,
            customThemes,
            imageUrl,
            discordName,
          } = await database.get.userInfo(token.user_id as string);

          let fixedImageUrl = imageUrl;
          if (
            imageUrl &&
            !imageUrl.startsWith("http") &&
            process.env.OCI_PROFILE_PAR_URL
          ) {
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
          console.error("Error fetching user info from DB:", dbError);
          //TODO: add some time of error handling/logging service
        }
      }

      if (trigger === "update" && session) {
        if (session.preferences) {
          await database.put.userPreferences(
            session.preferences,
            token.user_id as string,
          );
          token.preferences = { ...token.preferences, ...session.preferences };
        }
        if (session.customTheme) {
          await database.post.userCustomTheme(
            token.user_id as string,
            session.customTheme,
          );
          if (!token.customThemes) token.customThemes = [];
          token.customThemes.push(session.customTheme);
        }
        if (session.name) {
          await database.put.userName(token.user_id as string, session.name);
          token.name = session.name;
        }
        if (session.image && process.env.OCI_PROFILE_PAR_URL) {
          token.image = process.env.OCI_PROFILE_PAR_URL + session.image;
        }
      }

      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        try {
          await database.post.user(
            account.providerAccountId,
            user.name!,
            user.email!,
          );
          await database.post.userProfileImage(
            account.providerAccountId,
            user.image!,
          );
          await database.post.defaultUserPreferences(account.providerAccountId);
        } catch (error) {
          console.error("Database error during sign-in:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          discordName: token.discordName as string,
          name: (token.name as string) || session.user.name,
          perscomId: token.perscomId as string,
          id: token.user_id as string,
          image: token.image as string,
          preferences: token.preferences,
          customThemes: token.customThemes,
          roles: token.roles,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export const getAuthSession = async () => await getServerSession(authOptions);


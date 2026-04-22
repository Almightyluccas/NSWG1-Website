import { getServerSession, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { cookies } from "next/headers";
import { database } from "@/database";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith("https://");
const SESSION_COOKIE_NAME = SESSION_SECURE
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: Boolean(SESSION_SECURE),
        maxAge: SESSION_MAX_AGE,
      },
    },
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
        const cookieStore = await cookies();
        const rememberMeIntent = cookieStore.get("remember-me-intent")?.value;
        token.user_id = user.id;
        token.discordName = user.name;
        token.rememberMe = rememberMeIntent === "true";
        cookieStore.delete("remember-me-intent");
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
          const isDiscordAvatar =
            typeof fixedImageUrl === "string" &&
            (fixedImageUrl.includes("cdn.discordapp.com") ||
              fixedImageUrl.includes("media.discordapp.net"));

          token.roles = roles;
          token.perscomId = perscomId;
          token.name = name;
          token.image = isDiscordAvatar ? null : fixedImageUrl;
          token.preferences = preferences;
          token.customThemes = customThemes;
          token.discordName = discordName;
        } catch (dbError) {
          console.error("Error fetching user info from DB:", dbError);
          token.roles = [];
          token.customThemes = [];
          token.preferences = {
            activeThemeName: "Gold",
          };
        }
      }

      if (trigger === "update" && session) {
        if (session.preferences) {
          await database.put.userPreferences(
            session.preferences,
            token.user_id as string
          );
          token.preferences = { ...token.preferences, ...session.preferences };
        }
        if (session.customTheme) {
          await database.post.userCustomTheme(
            token.user_id as string,
            session.customTheme
          );
          if (!token.customThemes) token.customThemes = [];
          token.customThemes.push(session.customTheme);
        }
        if (session.name) {
          await database.put.userName(token.user_id as string, session.name);
          token.name = session.name;
        }
        if (session.image) {
          if (session.image.startsWith("http")) {
            token.image = session.image;
          } else if (process.env.OCI_PROFILE_PAR_URL) {
            token.image = process.env.OCI_PROFILE_PAR_URL + session.image;
          }
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
            user.email!
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
          preferences: token.preferences ?? {
            activeThemeName: "Gold",
          },
          customThemes: Array.isArray(token.customThemes) ? token.customThemes : [],
          roles: Array.isArray(token.roles) ? token.roles : [],
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

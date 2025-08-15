import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {getToken, JWT} from 'next-auth/jwt';
import {RefreshTokenResponse} from "@/types/nswg1Api";
import {DiscordRefreshTokenResponse} from "@/types/discord";

export async function POST(request: NextRequest): Promise<NextResponse<RefreshTokenResponse>>
{
  const token: JWT | null = await getToken({ req: request });

  if (!token || !token.refresh_token) {
    return NextResponse.json({ error: 'No refresh token available.' }, { status: 401 });
  }

  try {
    const response: Response = await fetch("https://discord.com/api/oauth2/token", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token as string,
      }),
      method: "POST"
    });

    const refreshedTokens: DiscordRefreshTokenResponse = await response.json();

    if (!response.ok) {
      console.error("Failed to refresh token with Discord:", refreshedTokens);
      return NextResponse.json({ error: 'Failed to refresh token.' }, { status: 500 });
    }

    return NextResponse.json({
      access_token: refreshedTokens.access_token,
      expires_in: Math.floor(Date.now() / 1000 + (refreshedTokens.expires_in ?? 3600)),
      // expires_at: Math.floor(Date.now() / 1000 + 30), // FOR TESTING
      refresh_token: refreshedTokens.refresh_token,
    });

  } catch (error) {
    console.error("Error in refresh API:", error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
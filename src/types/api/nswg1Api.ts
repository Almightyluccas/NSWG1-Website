export type RefreshTokenResponse =
  | {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    }
  | {
      error: string;
      details?: any;
    };

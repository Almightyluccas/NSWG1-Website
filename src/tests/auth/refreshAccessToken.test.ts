import { refreshAccessToken } from '@/lib/authOptions';
import { database } from '@/database';

jest.mock('@/database', () => ({
  database: {
    get: {
      userRefreshToken: jest.fn().mockResolvedValue('dummyRefreshToken')
    },
    put: {
      userRefreshToken: jest.fn().mockResolvedValue(undefined)
    }
  }
}));

const originalFetch = global.fetch;

describe('refreshAccessToken', () => {
  const dummyToken = { user_id: '123', access_token: 'oldAccess', expires_at: Math.floor(Date.now() / 1000 - 60) };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
    global.fetch = originalFetch;
  });

  test('should return new token on success', async () => {
    const refreshedTokens = {
      access_token: 'newAccess',
      refresh_token: 'newRefresh',
      expires_in: 3600
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(refreshedTokens)
    } as any);

    const newToken = await refreshAccessToken(dummyToken);
    expect(newToken.access_token).toBe(refreshedTokens.access_token);
    expect(newToken.refresh_token).toBe(refreshedTokens.refresh_token);
    expect(newToken.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(database.put.userRefreshToken).toHaveBeenCalledWith(dummyToken.user_id, refreshedTokens.refresh_token, refreshedTokens.expires_in || 604800);
  });

  test('should throw RefreshAccessTokenError on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({})
    } as any);

    await expect(refreshAccessToken(dummyToken)).rejects.toThrow('RefreshAccessTokenError');
    expect(database.put.userRefreshToken).toHaveBeenCalledWith(dummyToken.user_id, null, null);
  });
});
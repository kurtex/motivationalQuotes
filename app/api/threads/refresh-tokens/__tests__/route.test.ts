import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/database/db';
import Token from '@/app/lib/database/models/Token';
import { refreshLongLivedToken } from '@/app/lib/threads-api/auth-tokens/actions';

// Mock external dependencies
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            json: () => Promise.resolve(data),
            status: options?.status || 200,
        })),
    },
}));
jest.mock('@/app/lib/database/db');
jest.mock('@/app/lib/database/models/Token');
jest.mock('@/app/lib/threads-api/auth-tokens/actions');

const mockedConnectToDB = connectToDB as jest.Mock;
const mockedTokenFind = Token.find as jest.Mock;
const mockedRefreshLongLivedToken = refreshLongLivedToken as jest.Mock;

describe('POST /api/threads/refresh-tokens', () => {
    let mockRequest: Partial<NextRequest>;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        process.env = {
            ...originalEnv,
            CRON_SECRET: 'test-secret',
        };

        mockRequest = {
            headers: new Headers({
                'x-cron-secret': 'test-secret',
            }),
        };

        mockedConnectToDB.mockResolvedValue(null);

        // Mock Token.find to return a chainable object
        mockedTokenFind.mockImplementation(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]), // Default: no tokens
        }));

        mockedRefreshLongLivedToken.mockResolvedValue({
            access_token: 'new-access-token',
            expires_in: 5184000,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        process.env = originalEnv;
    });

    it('should return 401 if x-cron-secret is missing', async () => {
        mockRequest.headers = new Headers();

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(401);
        expect(jsonResponse).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if x-cron-secret is incorrect', async () => {
        mockRequest.headers = new Headers({
            'x-cron-secret': 'wrong-secret',
        });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(401);
        expect(jsonResponse).toEqual({ error: 'Unauthorized' });
    });

    it('should refresh tokens that are about to expire', async () => {
        const now = Math.floor(Date.now() / 1000);
        const expiringToken = {
            user_id: 'user1',
            access_token: 'old-token-1',
            last_updated: now - (86400 * 60) + 86399, // Expires in slightly less than 1 day
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        };
        const nonExpiringToken = {
            user_id: 'user2',
            access_token: 'old-token-2',
            last_updated: now - (86400 * 50), // Expires in 10 days
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        };

        mockedTokenFind.mockImplementationOnce(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([expiringToken, nonExpiringToken]),
        })).mockImplementationOnce(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]), // End pagination
        }));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(mockedConnectToDB).toHaveBeenCalled();
        expect(mockedRefreshLongLivedToken).toHaveBeenCalledTimes(1);
        expect(mockedRefreshLongLivedToken).toHaveBeenCalledWith('old-token-1');
        expect(expiringToken.save).toHaveBeenCalledTimes(1);
        expect(expiringToken.access_token).toBe('new-access-token');
        expect(expiringToken.expires_in).toBe(5184000);
        expect(nonExpiringToken.save).not.toHaveBeenCalled();
        expect(jsonResponse).toEqual({ refreshed: 1, errors: [] });
    });

    it('should handle errors during token refresh', async () => {
        const now = Math.floor(Date.now() / 1000);
        const expiringTokenWithError = {
            user_id: 'user3',
            access_token: 'old-token-3',
            last_updated: now - (86400 * 60) + 86399, // Expires in slightly less than 1 day
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        };

        mockedTokenFind.mockImplementationOnce(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([expiringTokenWithError]),
        })).mockImplementationOnce(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]), // End pagination
        }));

        mockedRefreshLongLivedToken.mockRejectedValue(new Error('Refresh failed'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(mockedRefreshLongLivedToken).toHaveBeenCalledWith('old-token-3');
        expect(expiringTokenWithError.save).not.toHaveBeenCalled();
        expect(jsonResponse.refreshed).toBe(0);
        expect(jsonResponse.errors).toEqual([{ user_id: 'user3', error: 'Error: Refresh failed' }]);
    });

    it('should process tokens in batches', async () => {
        const now = Math.floor(Date.now() / 1000);
        const tokensBatch1 = Array.from({ length: 100 }).map((_, i) => ({
            user_id: `user-batch1-${i}`,
            access_token: `token-batch1-${i}`,
            last_updated: now - (86400 * 60) + 86399,
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        }));
        const tokensBatch2 = Array.from({ length: 50 }).map((_, i) => ({
            user_id: `user-batch2-${i}`,
            access_token: `token-batch2-${i}`,
            last_updated: now - (86400 * 60) + 86399,
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        }));

        mockedTokenFind
            .mockImplementationOnce(() => ({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(tokensBatch1),
            }))
            .mockImplementationOnce(() => ({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(tokensBatch2),
            }))
            .mockImplementationOnce(() => ({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([]), // End pagination
            }));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(mockedTokenFind).toHaveBeenCalledTimes(3);
        expect(mockedRefreshLongLivedToken).toHaveBeenCalledTimes(150);
        expect(jsonResponse).toEqual({ refreshed: 150, errors: [] });
    });
});
import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/database/db';
import Token from '@/app/lib/database/models/Token';
import { refreshLongLivedToken } from '@/app/lib/threads-api/auth-tokens/actions';
import { getPlainThreadsToken } from '@/app/lib/database/actions';
import { encryptSecret } from '@/app/lib/utils/tokenSecurity';

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
jest.mock('@/app/lib/database/actions', () => ({
    getPlainThreadsToken: jest.fn((token: any) => token.__plain),
}));
jest.mock('@/app/lib/utils/tokenSecurity', () => ({
    encryptSecret: jest.fn(() => ({ value: 'enc', iv: 'iv', tag: 'tag' })),
    hashToken: jest.fn(() => 'hash'),
}));

const mockedConnectToDB = connectToDB as jest.Mock;
const mockedTokenFind = Token.find as jest.Mock;
const mockedRefreshLongLivedToken = refreshLongLivedToken as jest.Mock;
const mockedGetPlainToken = getPlainThreadsToken as jest.Mock;
const mockedEncryptSecret = encryptSecret as jest.Mock;

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
                'Authorization': `Bearer test-secret`,
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

    it('should return 401 if Authorization header is missing', async () => {
        mockRequest.headers = new Headers();

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(401);
        expect(jsonResponse).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if Authorization header is incorrect', async () => {
        mockRequest.headers = new Headers({
            'Authorization': 'Bearer wrong-secret',
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
            __plain: 'old-token-1',
            last_updated: now - (86400 * 60) + 86399, // Expires in slightly less than 1 day
            expires_in: 86400 * 60,
            save: jest.fn().mockResolvedValue(true),
        };
        const nonExpiringToken = {
            user_id: 'user2',
            __plain: 'old-token-2',
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
        expect(mockedGetPlainToken).toHaveBeenCalledWith(expiringToken);
        expect(mockedRefreshLongLivedToken).toHaveBeenCalledWith('old-token-1');
        expect(expiringToken.save).toHaveBeenCalledTimes(1);
        expect(mockedEncryptSecret).toHaveBeenCalledWith('new-access-token');
        expect(expiringToken.expires_in).toBe(5184000);
        expect(nonExpiringToken.save).not.toHaveBeenCalled();
        expect(jsonResponse).toEqual({ refreshed: 1, errors: [] });
    });

    it('should handle errors during token refresh', async () => {
        const now = Math.floor(Date.now() / 1000);
        const expiringTokenWithError = {
            user_id: 'user3',
            __plain: 'old-token-3',
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

        expect(mockedGetPlainToken).toHaveBeenCalledWith(expiringTokenWithError);
        expect(mockedRefreshLongLivedToken).toHaveBeenCalledWith('old-token-3');
        expect(expiringTokenWithError.save).not.toHaveBeenCalled();
        expect(jsonResponse.refreshed).toBe(0);
        expect(jsonResponse.errors).toEqual([{ user_id: 'user3', error: 'Error: Refresh failed' }]);
    });

    
});

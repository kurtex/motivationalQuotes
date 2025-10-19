import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import {
    getLongLivedToken,
    getShortLivedToken,
} from '@/app/lib/threads-api/auth-tokens/actions';
import {
    saveThreadsToken,
    updateThreadsToken,
} from '@/app/lib/database/actions';
import User from '@/app/lib/database/models/User';
import { connectToDB } from '@/app/lib/database/db';

// Mock external dependencies
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            json: () => Promise.resolve(data),
            status: options?.status || 200,
            headers: {
                append: jest.fn(),
            },
            cookies: {
                set: jest.fn(),
            }
        })),
    },
}));
jest.mock('@/app/lib/threads-api/auth-tokens/actions');
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/database/models/User');
jest.mock('@/app/lib/database/db');

const mockedGetShortLivedToken = getShortLivedToken as jest.Mock;
const mockedGetLongLivedToken = getLongLivedToken as jest.Mock;
const mockedSaveThreadsToken = saveThreadsToken as jest.Mock;
const mockedUpdateThreadsToken = updateThreadsToken as jest.Mock;
const mockedUserFindOne = User.findOne as jest.Mock;
const mockedUserCreate = User.create as jest.Mock;
const mockedConnectToDB = connectToDB as jest.Mock;

describe('POST /api/threads/auth', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn().mockResolvedValue({ code: 'mock-code' }),
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Default successful mocks
        mockedGetShortLivedToken.mockResolvedValue({
            access_token: 'short-token',
            user_id: 'mock-meta-user-id',
        });
        mockedGetLongLivedToken.mockResolvedValue({
            access_token: 'long-token',
            expires_in: 3600,
        });
        mockedUserFindOne.mockResolvedValue(null); // Assume user does not exist by default
        mockedUserCreate.mockResolvedValue({});
        mockedSaveThreadsToken.mockResolvedValue({
            access_token: 'long-token',
            expires_in: 3600,
        });
        mockedUpdateThreadsToken.mockResolvedValue({
            access_token: 'long-token',
            expires_in: 3600,
        });
        mockedConnectToDB.mockResolvedValue(null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Validation', () => {
        it('should return 400 if code is missing', async () => {
          mockRequest.json = jest.fn().mockResolvedValue({});
          const response = await POST(mockRequest as NextRequest);
          const jsonResponse = await response.json();
    
          expect(response.status).toBe(400);
          expect(jsonResponse.error).toBe('Invalid request data');
          expect(jsonResponse.issues.fieldErrors.code).toContain('Invalid input: expected string, received undefined');
        });
    
        it('should return 400 if code is an empty string', async () => {
          mockRequest.json = jest.fn().mockResolvedValue({ code: '   ' }); // Empty string
          // Mock a failure for this specific case
          mockedGetShortLivedToken.mockRejectedValue(new Error('Invalid code'));

          const response = await POST(mockRequest as NextRequest);
          const jsonResponse = await response.json();
    
          expect(response.status).toBe(400);
          expect(jsonResponse).toEqual({ error: "We couldn't retrieve the token" });
        });
    
        it('should return 400 if code is not a string', async () => {
          mockRequest.json = jest.fn().mockResolvedValue({ code: 12345 });
          const response = await POST(mockRequest as NextRequest);
          const jsonResponse = await response.json();
    
          expect(response.status).toBe(400);
          expect(jsonResponse.error).toBe('Invalid request data');
          expect(jsonResponse.issues.fieldErrors.code).toContain('Invalid input: expected string, received number');
        });
    });

    it('should return 400 if getShortLivedToken fails', async () => {
        mockedGetShortLivedToken.mockRejectedValue(new Error('Short token error'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse).toEqual({ error: "We couldn't retrieve the token" });
    });

    it('should return 500 if getLongLivedToken fails', async () => {
        mockedGetLongLivedToken.mockRejectedValue(new Error('Long token error'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: "There was an error logging in to Threads" });
    });

    it('should return 500 if metaUserId is missing from shortLiveToken', async () => {
        mockedGetShortLivedToken.mockResolvedValue({
            access_token: 'short-token',
            user_id: undefined,
        });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: "There was an error logging in to Threads" });
    });

    it('should return 500 if accessToken is missing from longLivedToken', async () => {
        mockedGetLongLivedToken.mockResolvedValue({
            access_token: undefined,
            expires_in: 3600,
        });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: "There was an error logging in to Threads" });
    });

    it('should return 500 if expiresIn is missing from longLivedToken', async () => {
        mockedGetLongLivedToken.mockResolvedValue({
            access_token: 'long-token',
            expires_in: undefined,
        });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: "There was an error logging in to Threads" });
    });

    it('should save a new user and token if user does not exist', async () => {
        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(mockedConnectToDB).toHaveBeenCalled();
        expect(mockedUserFindOne).toHaveBeenCalledWith({ meta_user_id: 'mock-meta-user-id' });
        expect(mockedUserCreate).toHaveBeenCalledWith({ meta_user_id: 'mock-meta-user-id' });
        expect(mockedSaveThreadsToken).toHaveBeenCalledWith(
            'mock-meta-user-id',
            'long-token',
            3600
        );
        expect(response.cookies.set).toHaveBeenCalledWith({
            name: "threads-token",
            value: "long-token",
            httpOnly: true,
            secure: false, // This is false in non-production environments
            sameSite: "strict",
            path: "/",
            maxAge: 3600,
        });
    });

    it('should update an existing user\'s token if user exists', async () => {
        mockedUserFindOne.mockResolvedValue({ _id: 'existing-user-id' });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(mockedConnectToDB).toHaveBeenCalled();
        expect(mockedUserFindOne).toHaveBeenCalledWith({ meta_user_id: 'mock-meta-user-id' });
        expect(mockedUserCreate).not.toHaveBeenCalled();
        expect(mockedUpdateThreadsToken).toHaveBeenCalledWith(
            'mock-meta-user-id',
            'long-token',
            3600
        );
        expect(mockedSaveThreadsToken).not.toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(jsonResponse).toEqual({ message: "Logged in to Threads" });
        expect(response.cookies.set).toHaveBeenCalledWith({
            name: "threads-token",
            value: "long-token",
            httpOnly: true,
            secure: false, // This is false in non-production environments
            sameSite: "strict",
            path: "/",
            maxAge: 3600,
        });
    });
});
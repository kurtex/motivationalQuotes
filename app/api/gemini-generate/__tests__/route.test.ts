import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { saveUniqueGeminiQuote, getMetaUserIdByThreadsAccessToken } from '@/app/lib/database/actions';
import Quote from '@/app/lib/database/models/Quote';
import User from '@/app/lib/database/models/User';
import { getThreadsCookie } from '@/app/lib/threads-api/threads-posts/actions';

// Mock external dependencies
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            json: () => Promise.resolve(data),
            status: options?.status || 200,
        })),
    },
}));
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/database/models/Quote');
jest.mock('@/app/lib/database/models/User');
jest.mock('@/app/lib/threads-api/threads-posts/actions');

const mockedSaveUniqueGeminiQuote = saveUniqueGeminiQuote as jest.Mock;
const mockedGetMetaUserIdByThreadsAccessToken = getMetaUserIdByThreadsAccessToken as jest.Mock;
const mockedQuoteFind = Quote.find as jest.Mock;
const mockedUserFindOne = User.findOne as jest.Mock;
const mockedGetThreadsCookie = getThreadsCookie as jest.Mock;

describe('POST /api/gemini-generate', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn().mockResolvedValue({}),
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Default successful mocks
        mockedGetThreadsCookie.mockResolvedValue('mock-access-token');
        mockedGetMetaUserIdByThreadsAccessToken.mockResolvedValue('mock-meta-user-id');
        mockedUserFindOne.mockResolvedValue({ _id: 'mock-user-db-id' });
        mockedQuoteFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue([]),
        });
        mockedSaveUniqueGeminiQuote.mockResolvedValue('Generated Quote');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return 401 if access token cookie is missing', async () => {
        mockedGetThreadsCookie.mockResolvedValue(null);

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(401);
        expect(jsonResponse).toEqual({ error: 'Unauthorized' });
    });

    it('should generate and return a unique quote successfully', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({ lastQuote: 'old quote' });
        mockedQuoteFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue([{ text: 'existing quote 1' }, { text: 'existing quote 2' }]),
        });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(200);
        expect(jsonResponse).toEqual({ quoteText: 'Generated Quote' });
        expect(mockedGetThreadsCookie).toHaveBeenCalled();
        expect(mockedGetMetaUserIdByThreadsAccessToken).toHaveBeenCalledWith('mock-access-token');
        expect(mockedUserFindOne).toHaveBeenCalledWith({ meta_user_id: 'mock-meta-user-id' });
        expect(mockedQuoteFind).toHaveBeenCalledWith({ user: 'mock-user-db-id' });
        expect(mockedSaveUniqueGeminiQuote).toHaveBeenCalledWith(
            'mock-access-token',
            ['existing quote 1', 'existing quote 2'],
            20
        );
    });

    it('should include lastQuote in recentQuotes if no other quotes are found', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({ lastQuote: 'last known quote' });
        mockedQuoteFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue([]),
        });

        await POST(mockRequest as NextRequest);

        expect(mockedSaveUniqueGeminiQuote).toHaveBeenCalledWith(
            'mock-access-token',
            ['last known quote'],
            20
        );
    });

    it('should return 500 if getMetaUserIdByThreadsAccessToken fails', async () => {
        mockedGetMetaUserIdByThreadsAccessToken.mockRejectedValue(new Error('Invalid token'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: 'Invalid token' });
    });

    it('should return 500 if user is not found', async () => {
        mockedUserFindOne.mockResolvedValue(null);

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: 'User not found' });
    });

    it('should return 500 if saveUniqueGeminiQuote fails', async () => {
        mockedSaveUniqueGeminiQuote.mockRejectedValue(new Error('Deduplication failed'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: 'Deduplication failed' });
    });
});

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getThreadsCookie } from '@/app/lib/threads-api/threads-posts/actions';
import { getMetaUserIdByThreadsAccessToken } from '@/app/lib/database/actions';
import User from '@/app/lib/database/models/User';
import Quote from '@/app/lib/database/models/Quote';
import { GeminiClient } from '@/app/lib/ai/geminiClient';

// Mock external dependencies
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            json: () => Promise.resolve(data),
            status: options?.status || 200,
        })),
    },
}));
jest.mock('@/app/lib/threads-api/threads-posts/actions');
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/database/models/User');
jest.mock('@/app/lib/database/models/Quote');
jest.mock('@/app/lib/ai/geminiClient');

const mockedGetThreadsCookie = getThreadsCookie as jest.Mock;
const mockedGetMetaUserIdByThreadsAccessToken = getMetaUserIdByThreadsAccessToken as jest.Mock;
const mockedUserFindOne = User.findOne as jest.Mock;
const mockedQuoteFind = Quote.find as jest.Mock;
const mockGeminiClient = GeminiClient as jest.Mock;
const mockGenerateContent = jest.fn();

describe('POST /api/gemini-generate/preview', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn().mockResolvedValue({}),
        };
        mockedGetThreadsCookie.mockResolvedValue('mock-access-token');
        mockedGetMetaUserIdByThreadsAccessToken.mockResolvedValue('mock-meta-user-id');
        mockedUserFindOne.mockResolvedValue({ _id: 'mock-user-db-id', active_prompt: 'prompt-id' });
        mockedQuoteFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue([]),
        });
        mockGeminiClient.mockImplementation(() => ({
            generateContent: mockGenerateContent,
        }));
    });

    it('should generate a preview successfully', async () => {
        const mockPrompt = "A preview prompt";
        const mockGeneratedText = "A generated preview";
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
        mockGenerateContent.mockResolvedValue(mockGeneratedText);

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(200);
        expect(jsonResponse).toEqual({ quoteText: mockGeneratedText });
        expect(mockGenerateContent).toHaveBeenCalled();
    });
});

import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { getThreadsCookie } from '@/app/lib/threads-api/threads-posts/actions';
import { getMetaUserIdByThreadsAccessToken } from '@/app/lib/database/actions';
import User from '@/app/lib/database/models/User';
import Quote from '@/app/lib/database/models/Quote';
import { generateGeminiStream } from '@/app/lib/ai/geminiClient';

// Mock dependencies
jest.mock('@/app/lib/threads-api/threads-posts/actions');
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/database/models/User');
jest.mock('@/app/lib/database/models/Quote');
jest.mock('@/app/lib/ai/geminiClient');

// Mock NextResponse separately to handle the stream case
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Headers(init?.headers),
    })),
  },
}));


const mockedGetThreadsCookie = getThreadsCookie as jest.Mock;
const mockedGetMetaUserIdByThreadsAccessToken = getMetaUserIdByThreadsAccessToken as jest.Mock;
const mockedUserFindOne = User.findOne as jest.Mock;
const mockedQuoteFind = Quote.find as jest.Mock;
const mockedGenerateGeminiStream = generateGeminiStream as jest.Mock;

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
  });

  it('should return a streaming response on success', async () => {
    const mockPrompt = 'A preview prompt';
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });

    // Mock the async generator stream
    async function* mockStream() {
      yield { text: () => 'Hello ' };
      yield { text: () => 'World' };
    }
    mockedGenerateGeminiStream.mockResolvedValue(mockStream());

    const response = await POST(mockRequest as NextRequest);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(ReadableStream);
    expect(mockedGenerateGeminiStream).toHaveBeenCalledWith(expect.stringContaining(mockPrompt));
  });

  describe('Validation', () => {
    it('should return 400 if prompt is missing', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({});
        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse.error).toBe('Invalid request data');
        expect(jsonResponse.issues.fieldErrors.prompt).toContain('Invalid input: expected string, received undefined');
    });

    it('should return 400 if prompt is an empty string', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: '   ' });
        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse.error).toBe('Invalid request data');
        expect(jsonResponse.issues.fieldErrors.prompt).toContain('Prompt is required');
    });

    it('should return 400 if prompt is not a string', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: 9876 });
        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse.error).toBe('Invalid request data');
        expect(jsonResponse.issues.fieldErrors.prompt).toContain('Invalid input: expected string, received number');
    });
  });

  it('should return 401 if no access token is found', async () => {
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: 'A valid prompt' }); // Add valid body
    mockedGetThreadsCookie.mockResolvedValue(null);
    const response = await POST(mockRequest as NextRequest);
    expect(response.status).toBe(401);
  });
});
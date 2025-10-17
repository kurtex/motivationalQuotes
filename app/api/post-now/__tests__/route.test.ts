import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { postThreadAction } from '@/app/lib/threads-api/threads-posts/actions';
import { saveUniqueGeminiQuote } from '@/app/lib/database/actions';
import { getCookie } from '@/app/lib/utils/cookies/actions';

// Mock dependencies
jest.mock('@/app/lib/threads-api/threads-posts/actions');
jest.mock('@/app/lib/database/actions');
jest.mock('@/app/lib/utils/cookies/actions');

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

const mockedPostThreadAction = postThreadAction as jest.Mock;
const mockedSaveUniqueGeminiQuote = saveUniqueGeminiQuote as jest.Mock;
const mockedGetCookie = getCookie as jest.Mock;

describe('POST /api/post-now', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    };
    mockedGetCookie.mockResolvedValue('mock-threads-token');
  });

  it('should post a quote successfully', async () => {
    const mockPrompt = 'Test prompt';
    const mockGeneratedQuote = 'Generated quote from test prompt';
    
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
    mockedSaveUniqueGeminiQuote.mockResolvedValue(mockGeneratedQuote);
    mockedPostThreadAction.mockResolvedValue({ success: true });

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      message: 'Quote posted successfully',
      quote: mockGeneratedQuote
    });
    expect(mockedSaveUniqueGeminiQuote).toHaveBeenCalledWith(
      'mock-threads-token',
      [],
      5,
      mockPrompt
    );
    expect(mockedPostThreadAction).toHaveBeenCalled();
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
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: 12345 });
        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse.error).toBe('Invalid request data');
        expect(jsonResponse.issues.fieldErrors.prompt).toContain('Invalid input: expected string, received number');
    });
  });

  it('should return 401 if no threads token is found', async () => {
    const mockPrompt = 'Test prompt';
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
    mockedGetCookie.mockResolvedValue(null);

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(401);
    expect(jsonResponse).toEqual({ error: 'Unauthorized: No Threads token found' });
    expect(mockedSaveUniqueGeminiQuote).not.toHaveBeenCalled();
    expect(mockedPostThreadAction).not.toHaveBeenCalled();
  });

  it('should handle errors from saveUniqueGeminiQuote', async () => {
    const mockPrompt = 'Test prompt';
    const mockError = new Error('Failed to generate quote');
    
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
    mockedSaveUniqueGeminiQuote.mockRejectedValue(mockError);

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({ error: 'Failed to generate quote' });
    expect(mockedPostThreadAction).not.toHaveBeenCalled();
  });

  it('should handle errors from postThreadAction', async () => {
    const mockPrompt = 'Test prompt';
    const mockGeneratedQuote = 'Generated quote from test prompt';
    const mockError = new Error('Failed to post to Threads');
    
    mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
    mockedSaveUniqueGeminiQuote.mockResolvedValue(mockGeneratedQuote);
    mockedPostThreadAction.mockRejectedValue(mockError);

    const response = await POST(mockRequest as NextRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({ error: 'Failed to post to Threads' });
  });
});
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { savePrompt } from '@/app/lib/database/actions';
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
jest.mock('@/app/lib/threads-api/threads-posts/actions');

const mockedSavePrompt = savePrompt as jest.Mock;
const mockedGetThreadsCookie = getThreadsCookie as jest.Mock;

describe('POST /api/gemini-generate', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn().mockResolvedValue({}),
        };
        mockedGetThreadsCookie.mockResolvedValue('mock-access-token');
    });

    it('should save a prompt and return it', async () => {
        const mockPrompt = "A new prompt";
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
        mockedSavePrompt.mockResolvedValue(mockPrompt);

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(200);
        expect(jsonResponse).toEqual({ promptText: mockPrompt });
        expect(mockedSavePrompt).toHaveBeenCalledWith(mockPrompt, 'mock-access-token');
    });

    it('should return 401 if access token is missing', async () => {
        mockedGetThreadsCookie.mockResolvedValue(null);

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(401);
        expect(jsonResponse).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if prompt is empty', async () => {
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: '   ' });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse).toEqual({ error: 'Prompt is required' });
        expect(mockedSavePrompt).not.toHaveBeenCalled();
    });

    it('should return 400 if prompt exceeds max length', async () => {
        const longPrompt = 'a'.repeat(1001);
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: longPrompt });

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(400);
        expect(jsonResponse).toEqual({ error: 'Prompt is too long' });
        expect(mockedSavePrompt).not.toHaveBeenCalled();
    });

    it('should return 500 if saving the prompt fails', async () => {
        const mockPrompt = "A new prompt";
        mockRequest.json = jest.fn().mockResolvedValue({ prompt: mockPrompt });
        mockedSavePrompt.mockRejectedValue(new Error('Database error'));

        const response = await POST(mockRequest as NextRequest);
        const jsonResponse = await response.json();

        expect(response.status).toBe(500);
        expect(jsonResponse).toEqual({ error: 'Database error' });
    });
});

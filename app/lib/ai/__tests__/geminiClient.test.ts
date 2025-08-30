import { GeminiClient, generateGeminiStream } from '../geminiClient';
import { GeminiModel, GeminiModelSpecialization } from '../geminiModels';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReadableStream } from 'stream/web';

// Mock the GoogleGenerativeAI library
const mockGenerateContent = jest.fn();
const mockEmbedContent = jest.fn();
const mockGenerateContentStream = jest.fn();
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContent: mockGenerateContent,
            embedContent: mockEmbedContent,
            generateContentStream: mockGenerateContentStream,
        })),
    })),
}));

describe('GeminiClient', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            GEMINI_API_KEY: 'test-api-key',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('generateContent', () => {
        it('should generate content for a text model', async () => {
            const prompt = 'test prompt';
            const expectedText = 'generated text';
            mockGenerateContent.mockResolvedValue({ response: { text: () => expectedText } });

            const client = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);
            const result = await client.generateContent(prompt);

            expect(result).toBe(expectedText);
            expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
            expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
        });


        it('should throw an error for a non-text model', async () => {
            const client = new GeminiClient(GeminiModel.GEMINI_EMBEDDING_EXP_03_07);
            await expect(client.generateContent('prompt')).rejects.toThrow(
                'The selected model does not support text generation.'
            );
        });
    });

    describe('embedContent', () => {
        it('should embed content for an embedding model', async () => {
            const text = 'test text';
            const expectedEmbedding = [1, 2, 3];
            mockEmbedContent.mockResolvedValue({ embedding: { values: expectedEmbedding } });

            const client = new GeminiClient(GeminiModel.GEMINI_EMBEDDING_EXP_03_07);
            const result = await client.embedContent(text);

            expect(result).toEqual(expectedEmbedding);
            expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
            expect(mockEmbedContent).toHaveBeenCalledWith(text);
        });

        it('should throw an error for a non-embedding model', async () => {
            const client = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);
            await expect(client.embedContent('text')).rejects.toThrow(
                'The selected model does not support embeddings.'
            );
        });
    });
});

describe('generateGeminiStream', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            GEMINI_API_KEY: 'test-api-key',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should generate a stream successfully', async () => {
        // Mock the stream response
        const mockStream = {
            [Symbol.asyncIterator]: jest.fn(),
        };
        mockGenerateContentStream.mockResolvedValue({ stream: mockStream });

        const result = await generateGeminiStream('test prompt');
        
        expect(result).toBe(mockStream);
        expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
        expect(mockGenerateContentStream).toHaveBeenCalledWith('test prompt');
    });

    it('should throw an error if prompt is empty', async () => {
        await expect(generateGeminiStream('')).rejects.toThrow('Prompt cannot be empty');
    });

    it('should throw an error if API key is not configured', async () => {
        process.env.GEMINI_API_KEY = '';
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('GEMINI_API_KEY is not configured');
    });

    it('should handle quota exceeded error', async () => {
        mockGenerateContentStream.mockRejectedValue(new Error('quota exceeded'));
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('API quota exceeded. Please try again later.');
    });

    it('should handle rate limit error', async () => {
        mockGenerateContentStream.mockRejectedValue(new Error('rate limit exceeded'));
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('Rate limit reached. Please try again in a few moments.');
    });

    it('should handle content filtering error', async () => {
        mockGenerateContentStream.mockRejectedValue(new Error('content filtered'));
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('The requested content was filtered by safety systems.');
    });

    it('should handle general model errors', async () => {
        mockGenerateContentStream.mockRejectedValue(new Error('Some model error'));
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('Model error: Some model error');
    });

    it('should handle network errors', async () => {
        const networkError = new TypeError('Failed to fetch');
        networkError.name = 'TypeError';
        mockGenerateContentStream.mockImplementation(() => {
            throw networkError;
        });
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('Model error: Failed to fetch');
    });

    it('should handle request timeout', async () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        mockGenerateContentStream.mockImplementation(() => {
            throw abortError;
        });
        await expect(generateGeminiStream('test prompt')).rejects.toThrow('Model error: The operation was aborted');
    });
});

import { GeminiClient } from '../geminiClient';
import { GeminiModel, GeminiModelSpecialization } from '../geminiModels';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI library
const mockGenerateContent = jest.fn();
const mockEmbedContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContent: mockGenerateContent,
            embedContent: mockEmbedContent,
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
            GeminiModelSpecialization[GeminiModel.GEMINI_1_5_FLASH] = 'text';
            const prompt = 'test prompt';
            const expectedText = 'generated text';
            mockGenerateContent.mockResolvedValue({ response: { text: () => expectedText } });

            const client = new GeminiClient(GeminiModel.GEMINI_1_5_FLASH);
            const result = await client.generateContent(prompt);

            expect(result).toBe(expectedText);
            expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
            expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
        });

        it('should throw an error for a non-text model', async () => {
            GeminiModelSpecialization[GeminiModel.TEXT_EMBEDDING_004] = 'embedding';
            const client = new GeminiClient(GeminiModel.TEXT_EMBEDDING_004);
            await expect(client.generateContent('prompt')).rejects.toThrow(
                'The selected model does not support text generation.'
            );
        });
    });

    describe('embedContent', () => {
        it('should embed content for an embedding model', async () => {
            GeminiModelSpecialization[GeminiModel.TEXT_EMBEDDING_004] = 'embedding';
            const text = 'test text';
            const expectedEmbedding = [1, 2, 3];
            mockEmbedContent.mockResolvedValue({ embedding: { values: expectedEmbedding } });

            const client = new GeminiClient(GeminiModel.TEXT_EMBEDDING_004);
            const result = await client.embedContent(text);

            expect(result).toEqual(expectedEmbedding);
            expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
            expect(mockEmbedContent).toHaveBeenCalledWith(text);
        });

        it('should throw an error for a non-embedding model', async () => {
            GeminiModelSpecialization[GeminiModel.GEMINI_1_5_PRO] = 'text';
            const client = new GeminiClient(GeminiModel.GEMINI_1_5_PRO);
            await expect(client.embedContent('text')).rejects.toThrow(
                'The selected model does not support embeddings.'
            );
        });
    });
});

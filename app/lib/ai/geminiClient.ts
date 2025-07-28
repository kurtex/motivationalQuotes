import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModel, GeminiModelSpecialization } from "./geminiModels";

/**
 * GeminiClient provides a typed interface for interacting with Gemini models.
 * It supports both text generation and embedding models, enforcing correct usage by model type.
 *
 * Example usage:
 *   const client = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);
 *   const text = await client.generateContent('Give me a motivational quote');
 *
 *   const embedClient = new GeminiClient(GeminiModel.GEMINI_EMBEDDING_EXP_03_07);
 *   const embedding = await embedClient.embedContent('Texto a vectorizar');
 */
export class GeminiClient {
	private apiKey: string;
	private model: GeminiModel;

	/**
	 * Creates a GeminiClient for a specific model.
	 * @param model GeminiModel enum value specifying the model to use.
	 */
	constructor(model: GeminiModel) {
		this.apiKey = process.env.GEMINI_API_KEY || "";
		this.model = model;
	}

	/**
	 * Generates text using a Gemini text model.
	 * @param prompt The prompt to send to the model.
	 * @returns The generated text.
	 * @throws Error if the model is not a text model.
	 */
	async generateContent(prompt: string): Promise<string> {
		if (GeminiModelSpecialization[this.model] !== "text") {
			throw new Error("The selected model does not support text generation.");
		}
		const genAI = new GoogleGenerativeAI(this.apiKey);
		const modelSelected = genAI.getGenerativeModel({ model: this.model });

		const result = await modelSelected.generateContent(prompt);
		const response = await result.response;
		return response.text();
	}

	/**
	 * Generates an embedding vector for the given text using a Gemini embedding model.
	 * @param text The text to embed.
	 * @returns The embedding vector as an array of numbers.
	 * @throws Error if the model is not an embedding model.
	 */
	async embedContent(text: string): Promise<number[]> {
		if (GeminiModelSpecialization[this.model] !== "embedding") {
			throw new Error("The selected model does not support embeddings.");
		}
		const genAI = new GoogleGenerativeAI(this.apiKey);
		const modelSelected = genAI.getGenerativeModel({ model: this.model });
		const result = await modelSelected.embedContent(text);
		return result.embedding.values;
	}
}
